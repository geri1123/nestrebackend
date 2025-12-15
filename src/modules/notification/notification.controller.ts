import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationSwagger } from './swagger/notification.swagger';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
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
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    const language = req.language;
    const userId = req['userId'];

    const notifications = await this.notificationService.getUserNotifications(
      userId,
      language,
      limit,
      offset,
    );

    const unreadCount = await this.notificationService.countUnreadNotifications(userId);
    
    return {
      notifications,
      unreadCount,
      total: notifications.length,
      limit,
      offset,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({
    status: 200,
    description: 'Returns the count of unread notifications',
  })
  async countMyUnread(@Req() req: RequestWithLang) {
    const userId = req['userId'];
    const count = await this.notificationService.countUnreadNotifications(userId);
    return { count };
  }

  @Get('online-status')
  @ApiOperation({ summary: 'Check if current user is connected to WebSocket' })
  @ApiResponse({
    status: 200,
    description: 'Returns online status',
  })
  async checkOnlineStatus(@Req() req: RequestWithLang) {
    const userId = req['userId'];
    const isOnline = await this.notificationService.isUserOnline(userId);
    return { userId, isOnline };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markNotificationAsRead(id);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: RequestWithLang) {
    const userId = req['userId'];
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.deleteNotification(id);
  }
}
// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Param,
//   Query,
//   Patch,
//   Req,
// } from '@nestjs/common';
// import { NotificationService } from './notification.service';
// import { CreateNotificationDto } from './dto/create-notification.dto';
// import { NotificationSwagger } from './swagger/notification.swagger';
// import type { RequestWithLang } from '../../middlewares/language.middleware';
// import { ApiOperation, ApiResponse } from '@nestjs/swagger';

// @Controller('notifications')
// export class NotificationController {
//   constructor(private readonly notificationService: NotificationService) {}

//   @Post()
//   @NotificationSwagger.CreateNotification()
//   async createNotification(@Body() data: CreateNotificationDto) {
//     return this.notificationService.sendNotification(data);
//   }

//   @Get()
//   @NotificationSwagger.GetMyNotifications()
//   async getMyNotifications(
//     @Req() req: RequestWithLang,
//     @Query('limit') limit = 10,
//     @Query('offset') offset = 0,
//   ) {
//     const language = req.language;
//     const userId = req['userId'];

//     const notifications = await this.notificationService.getUserNotifications(
//       userId,
//       language,
//       limit,
//       offset,
//     );

//     const unreadCount =
//       await this.notificationService.countUnreadNotifications(userId);
//     return {
//       notifications,
//       unreadCount,
//     };
//   }

//   @Get('unread-count')
//   async countMyUnread(@Req() req: RequestWithLang) {
//     const userId = req['userId'];
//     return this.notificationService.countUnreadNotifications(userId);
//   }

//   @ApiOperation({ summary: 'Mark a notification as read' })
//   @ApiResponse({
//     status: 200,
//     description: 'Notification marked as read successfully',
//   })
//   @Patch(':id/read')
//   async markAsRead(@Param('id') id: number) {
//     return this.notificationService.markNotificationAsRead(id);
//   }

//   @ApiOperation({ summary: 'Mark all notifications as read' })
//   @ApiResponse({
//     status: 200,
//     description: 'All notifications marked as read',
//   })
//   @Patch('mark-all-read')
//   async markAllAsRead(@Req() req: RequestWithLang) {
//     const userId = req['userId'];
//     return this.notificationService.markAllAsRead(userId);
//   }
// }


// // import { Controller, Get, Post, Body, Param, Query, Patch , Req } from "@nestjs/common";
// // import type { Request } from "express";
// // import { NotificationService } from "./notification.service.js";
// // import { LanguageCode } from "@prisma/client";
// // import { CreateNotificationDto } from "./dto/create-notification.dto.js";

// // import {  ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
// // import { NotificationSwagger } from "./swagger/notification.swagger.js";
// // import type { RequestWithLang } from "../../middlewares/language.middleware.js";

// // @Controller("notifications")
// // export class NotificationController {
// //   constructor(private readonly notificationService: NotificationService) {}

// //   @Post()
// //   @NotificationSwagger.CreateNotification()
// //   async createNotification(@Body() data: CreateNotificationDto) {
// //     return this.notificationService.sendNotification(data);
// //   }

// //     @Get()
// //    @NotificationSwagger.GetMyNotifications()
// //   async getMyNotifications(
// //   @Req() req: RequestWithLang,
// //   // @Query("lang") language: SupportedLang = "al",
// //   @Query("limit") limit = 10,
// //   @Query("offset") offset = 0
// // ) {
// //   const language = req.language;
// //   const userId = req["userId"];

// //   const notifications = await this.notificationService.getUserNotifications(
// //     userId,
// //     language,
// //     limit,
// //     offset
// //   );

  
// //   const unreadCount = await this.notificationService.countUnreadNotifications(userId);
// //   return {
// //     notifications,
// //     unreadCount,
// //   };
// // }
// //   // 🔢 Count unread for logged user
// //   @Get("unread-count")
// //   async countMyUnread(@Req() req: Request) {
// //     const userId = req["userId"];
// //     return this.notificationService.countUnreadNotifications(userId);
// //   }
// // @ApiOperation({ summary: "Mark a notification as read" })
// // @ApiParam({ name: "id", description: "ID of the notification to mark as read", example: 4 })
// // @ApiResponse({ status: 200, description: "Notification marked as read successfully" })
// // @ApiResponse({ status: 404, description: "Notification not found" })
// //   @Patch(":id/read")
// //   async markAsRead(@Param("id") id: number) {
// //     return this.notificationService.markNotificationAsRead(id);
// //   }
// // }