import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationTemplateService } from "./notifications-template.service";
import { NotificationRepository } from "./infrastructure/persistence/notification.repository";
@Module({
    controllers:[NotificationController],
    providers:[NotificationService ,NotificationTemplateService, NotificationRepository],
    exports:[NotificationService , NotificationTemplateService],
    

})
export class NotificationModule {}