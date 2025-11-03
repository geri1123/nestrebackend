import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationRepository } from "../repositories/notifications/notifications.repository";
import { NotificationTemplateService } from "./notifications-template.service";
@Module({
    controllers:[NotificationController],
    providers:[NotificationService ,NotificationTemplateService, NotificationRepository],
    exports:[NotificationService , NotificationTemplateService],
    

})
export class NotificationModule {}