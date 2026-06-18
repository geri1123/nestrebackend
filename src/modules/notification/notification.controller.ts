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
import { Throttle } from '../../common/decorators/throttle.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ── Static routes FIRST ────────────────────────────────

  @Get('unread-count')
  @Throttle(150, 60)
  async countMyUnread(@Req() req: RequestWithUser) {
    const userId = req.userId;
    const count = await this.notificationService.countUnreadNotifications(userId);
    return { count };
  }

  @Get('online-status')
  @Throttle(300, 60)
  async checkOnlineStatus(@Req() req: RequestWithUser) {
    const userId = req.userId;
    const isOnline = await this.notificationService.isUserOnline(userId);
    return { userId, isOnline };
  }

  @Patch('mark-all-read')
  @Throttle(10, 60)
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: RequestWithLang) {
    const userId = req['userId'];
    return this.notificationService.markAllAsRead(userId);
  }
@Get()
@Throttle(120, 60)
async getMyNotifications(
  @Req() req: RequestWithUser,
  @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  @Query('status') status?: 'read' | 'unread',
) {
  const language = req.language;
  const userId = req.userId;

  const result = await this.notificationService.getUserNotifications(
    userId,
    language,
    page,
    limit,
    status, // pass status
  );

  const unreadCount = await this.notificationService.countUnreadNotifications(userId);

  return {
    ...result,
    unreadCount,
  };
}
  @Post()
  @Throttle(20, 60)
  async createNotification(@Body() data: CreateNotificationDto) {
    return this.notificationService.sendNotification(data);
  }

  // ── Dynamic :id routes LAST ────────────────────────────

  @Patch(':id/read')
  @Throttle(60, 60)
  

  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    await this.notificationService.markNotificationAsRead(id);
    return { success: true, message: t("notificationMarkedAsRead", req.language) };
  }

  @Delete(':id')
  @Throttle(30, 60)
  async deleteNotification(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    await this.notificationService.deleteNotification(id);
    return { success: true, message: t("notificationDeletedSuccessfully", req.language) };
  }
}

