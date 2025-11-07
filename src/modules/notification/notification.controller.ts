import { Controller, Get, Post, Body, Param, Query, Patch , Req } from "@nestjs/common";
import type { Request } from "express";
import { NotificationService } from "./notification.service.js";
import { LanguageCode } from "@prisma/client";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";

import {  ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { NotificationSwagger } from "./swagger/notification.swagger.js";
import type { RequestWithLang } from "../../middlewares/language.middleware.js";

@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @NotificationSwagger.CreateNotification()
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.sendNotification(data);
  }

    @Get()
   @NotificationSwagger.GetMyNotifications()
  async getMyNotifications(
  @Req() req: RequestWithLang,
  // @Query("lang") language: SupportedLang = "al",
  @Query("limit") limit = 10,
  @Query("offset") offset = 0
) {
  const language = req.language;
  const userId = req["userId"];

  const notifications = await this.notificationService.getUserNotifications(
    userId,
    language,
    limit,
    offset
  );

  
  const unreadCount = await this.notificationService.countUnreadNotifications(userId);
  return {
    notifications,
    unreadCount,
  };
}
  // 🔢 Count unread for logged user
  @Get("unread-count")
  async countMyUnread(@Req() req: Request) {
    const userId = req["userId"];
    return this.notificationService.countUnreadNotifications(userId);
  }
@ApiOperation({ summary: "Mark a notification as read" })
@ApiParam({ name: "id", description: "ID of the notification to mark as read", example: 4 })
@ApiResponse({ status: 200, description: "Notification marked as read successfully" })
@ApiResponse({ status: 404, description: "Notification not found" })
  @Patch(":id/read")
  async markAsRead(@Param("id") id: number) {
    return this.notificationService.markNotificationAsRead(id);
  }
}