import { Injectable } from "@nestjs/common";
import { UpdateUserFieldsUseCase } from "../../../users/application/use-cases/update-user-fields.use-case";
import { EmailService } from "../../../../infrastructure/email/email.service";
import { RegistrationRequestEntity } from "../../../registration-request/domain/entities/registration-request.entity";
import { EmailQueueService } from "../../../../infrastructure/queue/services/email-queue.service";
import {
  EMAIL_EVENTS,
  EmailAgentRejectedEvent,
} from '../../../../infrastructure/events/email/email.events';
import { EventEmitter2 } from "@nestjs/event-emitter";
@Injectable()
export class RejectAgencyRequestUseCase {
  constructor(
    private readonly updateUserFields: UpdateUserFieldsUseCase,
    private readonly eventEmitter:EventEmitter2,
  ) {}

  async execute(request: RegistrationRequestEntity) {
    await this.updateUserFields.execute(request.userId, {
      status: "active",
      role: "user"
    });

    // Send rejection email
    // await this.emailQueue.sendAgentRejectedEmail(
    //   request.user?.email || "",
    //   `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim()
    // );
       this.eventEmitter.emit(
      EMAIL_EVENTS.AGENT_REJECTED,
      new EmailAgentRejectedEvent(request.user?.email || '', `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim()),
    );
  }
}