import { Module } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationRepository } from "../repositories/notifications/notifications.repository";
@Module({
    controllers:[NotificationController],
    providers:[NotificationService , NotificationRepository],
    exports:[NotificationService],
    

})
export class NotificationModule {}