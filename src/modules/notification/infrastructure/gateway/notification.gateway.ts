import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { SocketAuthService } from '../../../../infrastructure/websocket/socket-auth.service';
import { SocketConnectionService } from '../../../../infrastructure/websocket/socket-connection.service';
import { SocketRateLimitService } from '../../../../infrastructure/websocket/socket-rate-limit.service';
import { NotificationSocketService } from '../notification-socket.service';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  AuthenticatedSocket,
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
  private heartbeatInterval: NodeJS.Timeout;

  constructor(
    private readonly authService: SocketAuthService,
    private readonly connectionService: SocketConnectionService,
    private readonly rateLimitService: SocketRateLimitService,
    private readonly socketService: NotificationSocketService,
  ) {}

  afterInit() {
    this.logger.log('Notification WebSocket Gateway initialized');
    
    // Pass server instance to socket service
    this.socketService.setServer(this.server);

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.socketService.sendHeartbeat();
    }, 30000);
  }

  onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.connectionService.clearAll();
    this.rateLimitService.clear();
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Rate limiting
      const ip = client.handshake.address;
      if (!this.rateLimitService.checkRateLimit(ip)) {
        client.emit('error', { message: 'Too many connection attempts' });
        client.disconnect();
        return;
      }

      // Authentication
      const token = this.authService.extractToken(client);
      if (!token) {
        this.logger.warn(`No token - socket ${client.id}`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const decoded = this.authService.verifyToken(token);
      if (!decoded) {
        this.logger.warn(`Invalid token - socket ${client.id}`);
        client.emit('error', { message: 'Invalid or expired token' });
        client.disconnect();
        return;
      }

      // Set user ID on socket
      client.userId = decoded.userId;

      // Register connection
      this.connectionService.addConnection(decoded.userId, client.id);

      // Join user room
      client.join(`user:${decoded.userId}`);

      // Confirm connection
      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId: decoded.userId,
      });
    } catch (error) {
      this.logger.error(`Connection error - socket ${client.id}`, error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectionService.removeConnection(client.userId, client.id);
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

    client.join(`user:${client.userId}`);
    this.logger.log(`User ${client.userId} subscribed to notifications`);

    return { status: 'subscribed' };
  }

  // Expose connection service methods for use cases
  
    isUserOnline(userId: number): boolean {
    return this.connectionService.isUserOnline(userId);
  }

  getUserConnectionCount(userId: number): number {
    return this.connectionService.getUserConnectionCount(userId);
  }

 
  getConnectedUserIds(): number[] {
    return this.connectionService.getConnectedUserIds();
  }
}