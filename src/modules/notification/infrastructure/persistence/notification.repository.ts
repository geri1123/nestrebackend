import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import {
  INotificationRepository,
  NotificationData,
  GetNotificationsParams,
} from '../../domain/repository/notification.repository.interface';
import { LanguageCode, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: NotificationData) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        status: NotificationStatus.unread,
        metadata: data.metadata || {},
        notificationtranslation: {
          create: data.translations.map((translation) => ({
            languageCode: translation.languageCode,
          
            message: translation.message,
          })),
        },
      },
      include: {
        notificationtranslation: true,
      },
    });
  }

  async getNotifications(params: GetNotificationsParams) {
    const { userId, languageCode, limit = 10, offset = 0, status } = params;

    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        notificationtranslation: languageCode
          ? {
              where: {
              languageCode: languageCode,
              },
            }
          : true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async countUnread(userId: number): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.unread,
      },
    });
  }

  async changeNotificationStatus(notificationId: number, status: NotificationStatus) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status,
        ...(status === NotificationStatus.read && { readAt: new Date() }),
      },
    });
  }

  async markAllAsReadForUser(userId: number): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.unread,
      },
      data: {
        status: NotificationStatus.read,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async deleteNotification(notificationId: number) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async getNotificationById(notificationId: number) {
    return this.prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        notificationtranslation: true,
      },
    });
  }
}
