import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SocketConnectionService {
  private readonly logger = new Logger(SocketConnectionService.name);
  private connectedUsers = new Map<number, string[]>();

  addConnection(userId: number, socketId: string): void {
    const sockets = this.connectedUsers.get(userId) || [];
    if (!sockets.includes(socketId)) {
      this.connectedUsers.set(userId, [...sockets, socketId]);
      this.logger.log(
        `User ${userId} connected. Socket: ${socketId}. Total: ${sockets.length + 1}`
      );
    }
  }

  removeConnection(userId: number, socketId: string): void {
    const sockets = this.connectedUsers.get(userId);
    if (!sockets) return;

    const filtered = sockets.filter((id) => id !== socketId);
    if (filtered.length === 0) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} fully disconnected`);
    } else {
      this.connectedUsers.set(userId, filtered);
      this.logger.log(`User ${userId} connection removed. Remaining: ${filtered.length}`);
    }
  }

  getUserConnectionCount(userId: number): number {
    return this.connectedUsers.get(userId)?.length || 0;
  }

  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  getConnectedUserIds(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  getSocketIdsForUser(userId: number): string[] {
    return this.connectedUsers.get(userId) || [];
  }

  clearAll(): void {
    this.connectedUsers.clear();
  }
}