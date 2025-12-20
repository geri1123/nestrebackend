import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  NotificationPayload,
} from '../domain/interfaces/notification-events.interface';

@Injectable()
export class NotificationSocketService {
  private readonly logger = new Logger(NotificationSocketService.name);
  private server: Server<ClientToServerEvents, ServerToClientEvents>;

  setServer(server: Server<ClientToServerEvents, ServerToClientEvents>): void {
    this.server = server;
  }

  sendNotificationToUser(userId: number, notification: NotificationPayload): void {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }

    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  sendUnreadCountUpdate(userId: number, count: number): void {
    if (!this.server) {
      this.logger.error('WebSocket server not initialized');
      return;
    }

    this.server.to(`user:${userId}`).emit('unread_count', { count });
    this.logger.log(`Unread count (${count}) sent to user ${userId}`);
  }

  sendHeartbeat(): void {
    if (!this.server) return;
    this.server.emit('heartbeat', { timestamp: Date.now() });
  }

  broadcastToAll(event: string, data: any): void {
    if (!this.server) return;
    this.server.emit(event as any, data);
  }
}