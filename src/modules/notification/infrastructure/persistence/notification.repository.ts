// repositories/notification/NotificationRepository.ts

import {  NotificationStatus , LanguageCode } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service.js";
import { INotificationRepository, NotificationData } from "../../domain/repository/notification.repository.interface.js";
import { Injectable } from "@nestjs/common";
@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private prisma: PrismaService) {}

  async createNotification({ userId, type, translations }: NotificationData) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        status: NotificationStatus.unread,
        notificationtranslation: {
          create: translations.map((t) => ({
            languageCode: t.languageCode,
            message: t.message,
          })),
        },
      },
      include: {
        notificationtranslation: true,
      },
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
async getNotifications(params: {
  userId: number;
  limit?: number;
  offset?: number;
  languageCode?: LanguageCode;
}): Promise<Array<{ id: number; translations: Array<{ languageCode: LanguageCode; message: string }> }>> {
  const notifications = await this.prisma.notification.findMany({
    where: { userId: params.userId },
    take: params.limit,
    skip: params.offset,
    orderBy: { createdAt: "desc" },
    include: {
      notificationtranslation: {
        where: { languageCode: params.languageCode },
        select: { languageCode: true, message: true },
      },
    },
  });

  
  return notifications.map((n) => ({
    id: n.id,
     status: n.status,
    translations: n.notificationtranslation ?? [],
    
  }));
}
async changeNotificationStatus(notificationId: number, status: NotificationStatus) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status },
    });
  }
}
