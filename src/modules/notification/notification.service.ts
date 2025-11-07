import { Injectable } from "@nestjs/common";
import { NotificationRepository } from "../../repositories/notification/notification.repository.js";
import { NotificationData } from "../../repositories/notification/Inotification.repository.js";
import { NotificationStatus } from "@prisma/client";
import { SupportedLang } from "../../locales/index.js";
@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async sendNotification(data: NotificationData) {
    return this.notificationRepo.createNotification(data);
  }

  async getUserNotifications(userId: number, language: SupportedLang="al", limit = 10, offset = 0) {
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
    return this.notificationRepo.changeNotificationStatus(notificationId, NotificationStatus.read);
  }
}
