import { Controller, Get, Post, Body, Param, Query, Patch , Req } from "@nestjs/common";
import type { Request } from "express";
import { NotificationService } from "./notification.service.js";
import { LanguageCode } from "@prisma/client";
import { CreateNotificationDto } from "./dto/create-notification.dto.js";
import type { SupportedLang } from "../locales/index.js";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetNotificationsResponseDto } from "./dto/notification.response.dto.js";
@ApiTags("notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
    @ApiOperation({ summary: "Create a notification for a user" })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: 201, description: "Notification created successfully" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.sendNotification(data);
  }

    @Get()
    
     @ApiOperation({ summary: "Get all notifications for the logged-in user" })
  @ApiQuery({ name: "lang", required: false, description: "Language code", example: "en" })
  @ApiQuery({ name: "limit", required: false, description: "Number of notifications to fetch", example: 10 })
  @ApiQuery({ name: "offset", required: false, description: "Pagination offset", example: 0 })
  @ApiResponse({ status: 200, description: "List of notifications with unread count", type: GetNotificationsResponseDto })

  async getMyNotifications(
  @Req() req: Request,
  @Query("lang") language: SupportedLang = "al",
  @Query("limit") limit = 10,
  @Query("offset") offset = 0
) {
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