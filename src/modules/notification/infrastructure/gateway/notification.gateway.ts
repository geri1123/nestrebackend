import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, forwardRef, Inject, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../../../infrastructure/config/config.service';

import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
  NotificationPayload,
} from '../../domain/interfaces/notification-events.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
@Injectable()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedUsers = new Map<number, string[]>();
  private connectionAttempts = new Map<string, number[]>();
  private heartbeatInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');

    // Send heartbeat every 30 seconds to keep connections alive
    this.heartbeatInterval = setInterval(() => {
      this.server.emit('heartbeat', { timestamp: Date.now() });
    }, 30000);
  }

  onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Rate limiting by IP
      const ip = client.handshake.address;
      if (!this.checkRateLimit(ip)) {
        this.logger.warn(`Rate limit exceeded for IP ${ip}`);
        client.emit('error', { message: 'Too many connection attempts' });
        client.disconnect();
        return;
      }

      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} - No token provided`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      let decoded;
      try {
        decoded = this.jwtService.verify(token, {
          secret: this.config.jwtSecret,
        });
      } catch (jwtError) {
        this.logger.warn(`Invalid token for socket ${client.id}`, jwtError.message);
        client.emit('error', { message: 'Invalid or expired token' });
        client.disconnect();
        return;
      }

      const userId = decoded.userId;
      if (!userId) {
        this.logger.warn(`No userId in token for socket ${client.id}`);
        client.emit('error', { message: 'Invalid token payload' });
        client.disconnect();
        return;
      }

      client.userId = userId;

      // Store connection
      this.addConnection(userId, client.id);

      // Join user's personal room
      client.join(`user:${userId}`);

      this.logger.log(
        `User ${userId} connected with socket ${client.id}. Total connections: ${this.getUserConnectionCount(userId)}`,
      );

      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId,
      });
    } catch (error) {
      this.logger.error(`Connection error for socket ${client.id}`, error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userId;
    if (userId) {
      this.removeConnection(userId, client.id);
      this.logger.log(
        `User ${userId} disconnected. Socket: ${client.id}. Remaining connections: ${this.getUserConnectionCount(userId)}`,
      );
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: Date.now() });
  }

  @SubscribeMessage('subscribe_notifications')
  handleSubscribe(client: AuthenticatedSocket) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    // Re-join room in case of reconnection
    client.join(`user:${client.userId}`);
    this.logger.log(`User ${client.userId} subscribed to notifications`);

    // Note: Current state will be sent by the service when needed
    return { status: 'subscribed' };
  }

  // Emit notification to specific user
  sendNotificationToUser(userId: number, notification: NotificationPayload) {
    const socketCount = this.getUserConnectionCount(userId);
    if (socketCount === 0) {
      this.logger.debug(`User ${userId} is offline, notification stored for later`);
      return;
    }

    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId} (${socketCount} active connections)`);
  }

  // Emit unread count update
  sendUnreadCountUpdate(userId: number, count: number) {
    const socketCount = this.getUserConnectionCount(userId);
    if (socketCount === 0) {
      this.logger.debug(`User ${userId} is offline, skipping unread count update`);
      return;
    }

    this.server.to(`user:${userId}`).emit('unread_count', { count });
    this.logger.log(`Unread count (${count}) sent to user ${userId}`);
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get number of active connections for a user
  getUserConnectionCount(userId: number): number {
    return this.connectedUsers.get(userId)?.length || 0;
  }

  // Get all connected user IDs
  getConnectedUserIds(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Private helper methods
  private addConnection(userId: number, socketId: string): void {
    const sockets = this.connectedUsers.get(userId) || [];
    if (!sockets.includes(socketId)) {
      this.connectedUsers.set(userId, [...sockets, socketId]);
    }
  }

  private removeConnection(userId: number, socketId: string): void {
    const sockets = this.connectedUsers.get(userId);
    if (!sockets) return;

    const filtered = sockets.filter((id) => id !== socketId);
    if (filtered.length === 0) {
      this.connectedUsers.delete(userId);
    } else {
      this.connectedUsers.set(userId, filtered);
    }
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const attempts = this.connectionAttempts.get(ip) || [];

    // Keep only attempts from last minute
    const recentAttempts = attempts.filter((time) => now - time < 60000);

    if (recentAttempts.length >= 10) {
      return false;
    }

    recentAttempts.push(now);
    this.connectionAttempts.set(ip, recentAttempts);

    // Cleanup old entries every 100 attempts
    if (this.connectionAttempts.size > 100) {
      this.cleanupRateLimitCache();
    }

    return true;
  }

  private cleanupRateLimitCache(): void {
    const now = Date.now();
    for (const [ip, attempts] of this.connectionAttempts.entries()) {
      const recentAttempts = attempts.filter((time) => now - time < 60000);
      if (recentAttempts.length === 0) {
        this.connectionAttempts.delete(ip);
      } else {
        this.connectionAttempts.set(ip, recentAttempts);
      }
    }
  }

  private parseCookies(cookieHeader: string | undefined): Record<string, string> {
    if (!cookieHeader) return {};

    return cookieHeader.split(';').reduce((cookies, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
      return cookies;
    }, {} as Record<string, string>);
  }

  private extractToken(client: Socket): string | null {
    // Priority 1: Get from cookies (matches your JwtAuthGuard)
    const cookieHeader = client.handshake.headers.cookie;
    if (cookieHeader) {
      const cookies = this.parseCookies(cookieHeader);
      if (cookies.token) {
        this.logger.debug(`Token extracted from cookies for socket ${client.id}`);
        return cookies.token;
      }
    }

    // Priority 2: Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      this.logger.debug(`Token extracted from Authorization header for socket ${client.id}`);
      return authHeader.split(' ')[1];
    }

    // Priority 3: Auth object
    if (client.handshake.auth?.token) {
      this.logger.debug(`Token extracted from auth object for socket ${client.id}`);
      return client.handshake.auth.token;
    }

    // Priority 4: Query parameter (least secure, use as last resort)
    const queryToken = client.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      this.logger.debug(`Token extracted from query parameter for socket ${client.id}`);
      return queryToken;
    }

    this.logger.warn(`No token found in any location for socket ${client.id}`);
    return null;
  }
}