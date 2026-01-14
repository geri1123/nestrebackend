
import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationTemplateService } from './notifications-template.service';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { NOTIFICATION_REPO } from './domain/repository/notification.repository.interface';
import { SharedAuthModule } from '../../infrastructure/auth/modules/shared-auth.module';
import { SocketAuthService } from '../../infrastructure/websocket/socket-auth.service';
import { SocketConnectionService } from '../../infrastructure/websocket/socket-connection.service';
import { SocketRateLimitService } from '../../infrastructure/websocket/socket-rate-limit.service';
import { NotificationSocketService } from './infrastructure/notification-socket.service';
import { NotificationGateway } from './infrastructure/gateway/notification.gateway';

@Module({
  imports: [SharedAuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationGateway,
    NotificationSocketService,
    NotificationTemplateService,
      SocketAuthService,
    SocketConnectionService,
    SocketRateLimitService,
    NotificationService,
    {
      provide: NOTIFICATION_REPO,
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService, NotificationTemplateService],
})
export class NotificationModule {}