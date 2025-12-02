import { Injectable } from "@nestjs/common";
import { agencyagent_role_in_agency, user_role, user_status } from "@prisma/client";
import { SupportedLang } from "../../../../locales";
import { FindExistingAgentUseCase } from "../../../agent/application/use-cases/find-existing-agent.use-case";
import { CreateAgentUseCase } from "../../../agent/application/use-cases/create-agent.use-case";
import { AddAgentPermissionsUseCase } from "../../../agent/application/use-cases/add-agenct-permissons.use-case";
import { UpdateUserFieldsUseCase } from "../../../users/application/use-cases/update-user-fields.use-case";
import { EmailService } from "../../../../infrastructure/email/email.service";
import { RegistrationRequestEntity } from "../../../registration-request/domain/entities/registration-request.entity";

export interface ApproveRequestInput {
  request: RegistrationRequestEntity;
  agencyId: number;
  approvedBy: number;
  roleInAgency: agencyagent_role_in_agency;
  commissionRate?: number;
  permissions?: Record<string, any>;
}

@Injectable()
export class ApproveAgencyRequestUseCase {
  constructor(
    private readonly findExistingAgent: FindExistingAgentUseCase,
    private readonly createAgent: CreateAgentUseCase,
    private readonly addPermissions: AddAgentPermissionsUseCase,
    private readonly updateUserFields: UpdateUserFieldsUseCase,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: ApproveRequestInput, language: SupportedLang = "al") {
    const { request, agencyId, approvedBy, roleInAgency, commissionRate, permissions } = input;

    // Check if agent already exists
    await this.findExistingAgent.execute(request.userId, language);

    // Create agent
    const agent = await this.createAgent.execute({
      agencyId,
      agentId: request.userId,
      addedBy: approvedBy,
      idCardNumber: request.idCardNumber || "",
      roleInAgency,
      commissionRate,
      status: "active",
    });

    // Update user fields if needed
    const updates: any = {};
    if (request.user?.role !== user_role.agent) {
      updates.role = user_role.agent;
    }
    if (request.user?.status !== user_status.active) {
      updates.status = user_status.active;
    }

    if (Object.keys(updates).length > 0) {
      await this.updateUserFields.execute(request.userId, updates);
    }

    // Add permissions
    await this.addPermissions.execute(
      agent.id,
      agencyId,
      permissions && Object.keys(permissions).length > 0 ? permissions : {}
    );

    // Send welcome email
    await this.emailService.sendAgentWelcomeEmail(
      request.user?.email || "",
      `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim()
    );

    return agent;
  }
}
