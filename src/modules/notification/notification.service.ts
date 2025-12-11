import { Inject, Injectable } from "@nestjs/common";
import {type INotificationRepository, NOTIFICATION_REPO, NotificationData } from "./domain/repository/notification.repository.interface.js";
import { NotificationStatus } from "@prisma/client";
import { SupportedLang } from "../../locales/index.js";
@Injectable()
export class NotificationService {

  constructor(
    @Inject(NOTIFICATION_REPO)
    private readonly notificationRepo: INotificationRepository) {}

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
