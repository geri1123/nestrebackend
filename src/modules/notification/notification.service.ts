
import { Inject, Injectable } from '@nestjs/common';
import {
  type INotificationRepository,
  NOTIFICATION_REPO,
  NotificationData,
} from './domain/repository/notification.repository.interface';
import { NotificationStatus } from '@prisma/client';
import { SupportedLang } from '../../locales/index';
import { NotificationSocketService } from './infrastructure/notification-socket.service';
import { NotificationGateway } from './infrastructure/gateway/notification.gateway';
import { NotificationTemplateService } from './notifications-template.service';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPO)
    private readonly notificationRepo: INotificationRepository,
    private readonly notificationSocket: NotificationSocketService,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationTemplateService: NotificationTemplateService
  ) {}

 async sendNotification(data: Omit<NotificationData, 'translations'> & { 
    translations?: NotificationData['translations'];
    templateData?: any; 
  }) {
    try {
      const translations = data.translations ?? 
        this.notificationTemplateService.getAllTranslations(data.type, data.templateData ?? {});

      
      const notification = await this.notificationRepo.createNotification({
        ...data,
        translations,
      });

      if (this.notificationGateway.isUserOnline(data.userId)) {
        this.notificationSocket.sendNotificationToUser(data.userId, {
          id: notification.id,
          type: notification.type,
          status: notification.status,
          translations: notification.notificationtranslation,
          createdAt: notification.createdAt,
        });

        const unreadCount = await this.countUnreadNotifications(data.userId);
        this.notificationSocket.sendUnreadCountUpdate(data.userId, unreadCount);
      }

      return notification;
    } catch (error) {
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
      this.notificationSocket.sendUnreadCountUpdate(notification.userId, unreadCount);
    }

    return notification;
  }

  async markAllAsRead(userId: number) {
    const result = await this.notificationRepo.markAllAsReadForUser(userId);

    // Update unread count to 0 via WebSocket only if online
    if (this.notificationGateway.isUserOnline(userId)) {
      this.notificationSocket.sendUnreadCountUpdate(userId, 0);
    }

    return { marked: result.count };
  }

  async deleteNotification(notificationId: number) {
    const notification = await this.notificationRepo.deleteNotification(notificationId);

    // Update unread count if the deleted notification was unread
    if (notification && notification.status === NotificationStatus.unread) {
      if (this.notificationGateway.isUserOnline(notification.userId)) {
        const unreadCount = await this.countUnreadNotifications(notification.userId);
        this.notificationSocket.sendUnreadCountUpdate(notification.userId, unreadCount);
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
