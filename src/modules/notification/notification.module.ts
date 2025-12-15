
import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationTemplateService } from './notifications-template.service';
import { NotificationRepository } from './infrastructure/persistence/notification.repository';
import { NOTIFICATION_REPO } from './domain/repository/notification.repository.interface';
import { NotificationGateway } from './infrastructure/gateway/notification.gateway';
import { SharedAuthModule } from '../../infrastructure/auth/shared-auth.module';

@Module({
  imports: [SharedAuthModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationTemplateService,
    NotificationGateway,
    {
      provide: NOTIFICATION_REPO,
      useClass: NotificationRepository,
    },
  ],
  exports: [NotificationService, NotificationTemplateService, NotificationGateway],
})
export class NotificationModule {}