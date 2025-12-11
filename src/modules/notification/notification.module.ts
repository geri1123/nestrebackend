import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationTemplateService } from "./notifications-template.service";
import { NotificationRepository } from "./infrastructure/persistence/notification.repository";
import { NOTIFICATION_REPO } from "./domain/repository/notification.repository.interface";
@Module({
    controllers:[NotificationController],
    providers:[
        NotificationService,
        NotificationTemplateService, 
         {
      provide: NOTIFICATION_REPO,
      useClass: NotificationRepository,
    },
        ],
    exports:[NotificationService , NotificationTemplateService],
    

})
export class NotificationModule {}