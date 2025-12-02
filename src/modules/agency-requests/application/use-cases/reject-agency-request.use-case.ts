import { Injectable } from "@nestjs/common";
import { UpdateUserFieldsUseCase } from "../../../users/application/use-cases/update-user-fields.use-case";
import { EmailService } from "../../../../infrastructure/email/email.service";
import { RegistrationRequestEntity } from "../../../registration-request/domain/entities/registration-request.entity";

@Injectable()
export class RejectAgencyRequestUseCase {
  constructor(
    private readonly updateUserFields: UpdateUserFieldsUseCase,
    private readonly emailService: EmailService,
  ) {}

  async execute(request: RegistrationRequestEntity) {
    // Update user status back to active with user role
    await this.updateUserFields.execute(request.userId, {
      status: "active",
      role: "user"
    });

    // Send rejection email
    await this.emailService.sendAgentRejectedEmail(
      request.user?.email || "",
      `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim()
    );
  }
}