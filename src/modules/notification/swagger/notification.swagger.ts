// src/notifications/swagger/notification.swagger.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { ApiSuccessResponse, ApiBadRequestResponse, ApiUnauthorizedResponse } from '../../../common/swagger/response.helper.ts';

@ApiTags('Notifications')
export class NotificationSwagger {

  // --------------------------
  // CREATE NOTIFICATION
  // --------------------------
  static CreateNotification() {
    return applyDecorators(
      ApiOperation({ summary: 'Send a notification to a user' }),
      ApiBody({ type: CreateNotificationDto, description: 'Notification payload with translations' }),
      ApiSuccessResponse('Notification sent successfully', {
        data: {
          id: 1,
          userId: 123,
          type: 'agent_pending',
          translations: [
            { languageCode: 'en', message: 'John Smith has confirmed their email.' },
            { languageCode: 'al', message: 'John Smith ka konfirmuar email-in e tij.' }
          ]
        }
      }),
      ApiBadRequestResponse('Invalid notification data', {
        errors: {
          userId: ['User ID is required'],
          type: ['Type is required'],
          translations: ['At least one translation is required']
        }
      }),
      ApiUnauthorizedResponse()
    );
  }

  // --------------------------
  // GET USER NOTIFICATIONS
  // --------------------------
  static GetMyNotifications() {
    return applyDecorators(
      ApiOperation({ summary: 'Get notifications for the logged-in user' }),
      ApiQuery({ name: 'limit', required: false, description: 'Limit number of notifications', example: 10 }),
      ApiQuery({ name: 'offset', required: false, description: 'Pagination offset', example: 0 }),
      ApiSuccessResponse('Notifications fetched successfully', {
        data: {
          notifications: [
            {
              id: 1,
              type: 'agent_pending',
              translations: [
                { languageCode: 'en', message: 'John Smith has confirmed their email.' }
              ],
              read: false
            }
          ],
          unreadCount: 5
        }
      }),
      ApiUnauthorizedResponse()
    );
  }

  // --------------------------
  // COUNT UNREAD NOTIFICATIONS
  // --------------------------
  static CountUnread() {
    return applyDecorators(
      ApiOperation({ summary: 'Get unread notification count for logged-in user' }),
      ApiSuccessResponse('Unread notifications count fetched successfully', {
        data: { unreadCount: 5 }
      }),
      ApiUnauthorizedResponse()
    );
  }

  // --------------------------
  // MARK NOTIFICATION AS READ
  // --------------------------
  static MarkAsRead() {
    return applyDecorators(
      ApiOperation({ summary: 'Mark a notification as read' }),
      ApiParam({ name: 'id', description: 'Notification ID to mark as read', example: 4 }),
      ApiSuccessResponse('Notification marked as read successfully', {
        data: { id: 4, read: true }
      }),
      ApiBadRequestResponse('Notification not found', {
        errors: { id: ['Notification with this ID does not exist'] }
      }),
      ApiUnauthorizedResponse()
    );
  }
}
