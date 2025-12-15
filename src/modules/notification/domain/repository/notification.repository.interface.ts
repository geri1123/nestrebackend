import { LanguageCode, NotificationStatus } from '@prisma/client';
import { SupportedLang } from '../../../../locales';

export const NOTIFICATION_REPO = 'NOTIFICATION_REPO';

export interface NotificationData {
  userId: number;
  type: string;
  translations: Array<{
    languageCode: SupportedLang;
   
    message: string;
  }>;
  metadata?: Record<string, any>;
}

export interface GetNotificationsParams {
  userId: number;
  languageCode?: LanguageCode;
  limit?: number;
  offset?: number;
  status?: NotificationStatus;
}

export interface INotificationRepository {
  createNotification(data: NotificationData): Promise<any>;
  
  getNotifications(params: GetNotificationsParams): Promise<any[]>;
  
  countUnread(userId: number): Promise<number>;
  
  changeNotificationStatus(
    notificationId: number,
    status: NotificationStatus,
  ): Promise<any>;
  
  // New method for bulk update
  markAllAsReadForUser(userId: number): Promise<{ count: number }>;
  
  deleteNotification(notificationId: number): Promise<any>;
  
  getNotificationById(notificationId: number): Promise<any>;
}