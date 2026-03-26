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
import { ApiNotificationDecorators } from './decorators/notification.swagger.decorator';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {type RequestWithUser } from '../../common/types/request-with-user.interface';
import { t } from '../../locales';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ── Static routes FIRST ────────────────────────────────

  @Get('unread-count')
  async countMyUnread(@Req() req: RequestWithUser) {
    const userId = req.userId;
    const count = await this.notificationService.countUnreadNotifications(userId);
    return { count };
  }

  @Get('online-status')
  async checkOnlineStatus(@Req() req: RequestWithUser) {
    const userId = req.userId;
    const isOnline = await this.notificationService.isUserOnline(userId);
    return { userId, isOnline };
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: RequestWithLang) {
    const userId = req['userId'];
    return this.notificationService.markAllAsRead(userId);
  }

  // ── Collection routes ──────────────────────────────────

  @Get()
  async getMyNotifications(
    @Req() req: RequestWithUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
    @Query('offset', new ParseIntPipe({ optional: true })) offset = 0,
  ) {
    const language = req.language;
    const userId = req.userId;
    const notifications = await this.notificationService.getUserNotifications(userId, language, limit, offset);
    const unreadCount = await this.notificationService.countUnreadNotifications(userId);
    return { notifications, unreadCount, total: notifications.length, limit, offset };
  }

  @Post()
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.sendNotification(data);
  }

  // ── Dynamic :id routes LAST ────────────────────────────

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    await this.notificationService.markNotificationAsRead(id);
    return { success: true, message: t("notificationMarkedAsRead", req.language) };
  }

  @Delete(':id')
  async deleteNotification(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    await this.notificationService.deleteNotification(id);
    return { success: true, message: t("notificationDeletedSuccessfully", req.language) };
  }
}

