import { Controller, Get, Post, Body, Param, Query, Patch } from "@nestjs/common";
import { NotificationService } from "./notification.service.js";
import { LanguageCode } from "@prisma/client";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";
import type { SupportedLang } from "../locales/index.js";
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.sendNotification(data);
  }

  @Get(":userId")
  async getNotifications(
    @Param("userId") userId: number,
    @Query("language") language: SupportedLang="al",
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.notificationService.getUserNotifications(userId, language, limit, offset);
  }

  @Get(":userId/unread-count")
  async countUnread(@Param("userId") userId: number) {
    return this.notificationService.countUnreadNotifications(userId);
  }

  @Patch(":id/read")
  async markAsRead(@Param("id") id: number) {
    return this.notificationService.markNotificationAsRead(id);
  }
}