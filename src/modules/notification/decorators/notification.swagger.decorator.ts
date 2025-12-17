import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiSuccessResponse,
  ApiUnauthorizedResponse,
} from '../../../common/swagger/response.helper.ts.js';

export const ApiNotificationDecorators = {
  CreateNotification: () =>
    applyDecorators(
      HttpCode(HttpStatus.CREATED),
      ApiOperation({
        summary: 'Create and send a notification',
      }),
      ApiSuccessResponse('Notification sent successfully'),
      ApiUnauthorizedResponse(),
    ),
GetMyNotifications: () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get my notifications',
      description:
        'Returns paginated notifications for the authenticated user.',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      example: 10,
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      example: 0,
    }),
    ApiSuccessResponse('Notifications retrieved successfully', {
      notifications: [
        {
          id: 1,
          userId: 2,
          type: 'user_send_request',
          status: 'unread',
          metadata: {
            username: 'adadassw',
          },
          readAt: null,
          createdAt: '2025-12-17T15:47:09.145Z',
          notificationtranslation: [
            {
              id: 1,
              notificationId: 1,
              languageCode: 'al',
              message:
                'user123 kërkon të bashkohet me agjencinë tuaj.',
            },
          ],
        },
      ],
      unreadCount: 1,
      total: 1,
      limit: 10,
      offset: 0,
    }),
    ApiUnauthorizedResponse(),
  ),
   MarkNotificationAsRead: () =>
    applyDecorators(
      HttpCode(HttpStatus.OK),
      ApiBearerAuth(),
      ApiOperation({
        summary: 'Mark a notification as read',
      }),
      ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'Notification ID to mark as read',
      }),
      ApiSuccessResponse('Notification marked as read'),
      ApiUnauthorizedResponse(),
    ),
    DeleteNotification: () =>
  applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a notification',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      example: 1,
      description: 'Notification ID to delete',
    }),
    ApiSuccessResponse('Notification deleted successfully'),
    ApiUnauthorizedResponse(),
  ),
};