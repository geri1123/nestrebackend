import { Inject, Injectable, forwardRef } from '@nestjs/common';
import {
  type INotificationRepository,
  NOTIFICATION_REPO,
  NotificationData,
} from './domain/repository/notification.repository.interface';
import { NotificationStatus } from '@prisma/client';
import { SupportedLang } from '../../locales/index';
import { NotificationGateway } from './infrastructure/gateway/notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPO)
    private readonly notificationRepo: INotificationRepository,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async sendNotification(data: NotificationData) {
    try {
      // Create notification in database
      const notification = await this.notificationRepo.createNotification(data);

      // Send real-time notification via WebSocket only if user is online
      if (this.notificationGateway.isUserOnline(data.userId)) {
        this.notificationGateway.sendNotificationToUser(data.userId, {
          id: notification.id,
          type: notification.type,
          status: notification.status,
          translations: notification.notificationtranslation,
          createdAt: notification.createdAt,
        });

        // Update unread count
        const unreadCount = await this.countUnreadNotifications(data.userId);
        this.notificationGateway.sendUnreadCountUpdate(data.userId, unreadCount);
      }

      return notification;
    } catch (error) {
      // Log error but don't fail - notification is still stored in DB
      console.error('Failed to send real-time notification:', error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: number,
    language: SupportedLang = 'al',
    limit = 10,
    offset = 0,
  ) {
    return this.notificationRepo.getNotifications({
      userId,
      languageCode: language,
      limit,
      offset,
    });
  }

  async countUnreadNotifications(userId: number) {
    return this.notificationRepo.countUnread(userId);
  }

  async markNotificationAsRead(notificationId: number) {
    const notification = await this.notificationRepo.changeNotificationStatus(
      notificationId,
      NotificationStatus.read,
    );

    // Update unread count for the user via WebSocket only if online
    if (notification && this.notificationGateway.isUserOnline(notification.userId)) {
      const unreadCount = await this.countUnreadNotifications(notification.userId);
      this.notificationGateway.sendUnreadCountUpdate(notification.userId, unreadCount);
    }

    return notification;
  }

  async markAllAsRead(userId: number) {
    // Use bulk update instead of looping
    const result = await this.notificationRepo.markAllAsReadForUser(userId);

    // Update unread count to 0 via WebSocket only if online
    if (this.notificationGateway.isUserOnline(userId)) {
      this.notificationGateway.sendUnreadCountUpdate(userId, 0);
    }

    return { marked: result.count };
  }

  async deleteNotification(notificationId: number) {
    const notification = await this.notificationRepo.deleteNotification(notificationId);

    // Update unread count if the deleted notification was unread
    if (notification && notification.status === NotificationStatus.unread) {
      if (this.notificationGateway.isUserOnline(notification.userId)) {
        const unreadCount = await this.countUnreadNotifications(notification.userId);
        this.notificationGateway.sendUnreadCountUpdate(notification.userId, unreadCount);
      }
    }

    return notification;
  }

  async getOnlineUsers(): Promise<number[]> {
    return this.notificationGateway.getConnectedUserIds();
  }

  async isUserOnline(userId: number): Promise<boolean> {
    return this.notificationGateway.isUserOnline(userId);
  }
}