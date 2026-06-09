
import { BadRequestException, Injectable } from "@nestjs/common";
import { AgencyAgentRoleInAgency, AgencyAgentStatus, UserRole, UserStatus } from "@prisma/client";
import { SupportedLang, t } from "../../../../locales";
import { FindExistingAgentUseCase } from "../../../agent/application/use-cases/find-existing-agent.use-case";
import { CreateAgentUseCase } from "../../../agent/application/use-cases/create-agent.use-case";
import { AddAgentPermissionsUseCase } from "../../../agent/application/use-cases/add-agenct-permissons.use-case";
import { UpdateUserFieldsUseCase } from "../../../users/application/use-cases/update-user-fields.use-case";
import { RegistrationRequestEntity } from "../../../registration-request/domain/entities/registration-request.entity";
import { FindUserByIdUseCase } from "../../../users/application/use-cases/find-user-by-id.use-case";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { NotificationService } from "../../../notification/notification.service";
import { EmailQueueService } from "../../../../infrastructure/queue/services/email-queue.service";
import { IAgentDomainRepository } from "../../../agent/domain/repositories/agents.repository.interface";
import { Inject } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../../agent/domain/repositories/agent.repository.tokens";
import { IAgentPermissionDomainRepository } from "../../../agent/domain/repositories/agent-permission.repository.interface";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EMAIL_EVENTS, EmailAgentWelcomeEvent } from "../../../../infrastructure/events/email/email.events";
export interface ApproveRequestInput {
  request: RegistrationRequestEntity;
  agencyId: number;
  approvedBy: number;
  roleInAgency: AgencyAgentRoleInAgency;
  commissionRate?: number;
  permissions?: Record<string, any>;
}

@Injectable()
export class ApproveAgencyRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly findExistingAgent: FindExistingAgentUseCase,
    private readonly createAgent: CreateAgentUseCase,
    private readonly addPermissions: AddAgentPermissionsUseCase,
    private readonly updateUserFields: UpdateUserFieldsUseCase,
    private readonly getuser: FindUserByIdUseCase,
    private readonly notificationService: NotificationService,
      private readonly eventEmitter: EventEmitter2,
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY)
    private readonly agentPermissionRepo: IAgentPermissionDomainRepository,
  ) {}

  async execute(input: ApproveRequestInput, language: SupportedLang = "al") {
    const { request, agencyId, approvedBy, roleInAgency, commissionRate, permissions } = input;

    // Validate user
    const user = await this.getuser.execute(request.userId, language);
    if (!user.emailVerified) {
      throw new BadRequestException(t("emailNotVerified", language));
    }

    // Returns terminated agent or null, throws if active/inactive
    const existingAgent = await this.findExistingAgent.execute(request.userId, language);

    const agent = await this.prisma.$transaction(async (tx) => {

      let agent;

      if (existingAgent) {
        // Terminated agent rejoining — update existing record
        agent = await this.agentRepo.updateAgencyAgent(existingAgent.id, {
          roleInAgency,
          commissionRate,
          status: AgencyAgentStatus.active,
          endDate: null,
        }, tx);

        // Update existing permissions
        const existingPermissions = await this.agentPermissionRepo.getPermissionsByAgentId(existingAgent.id);
        if (existingPermissions) {
          await this.agentPermissionRepo.updatePermissions(existingAgent.id, permissions ?? {});
        } else {
          await this.addPermissions.execute(existingAgent.id, agencyId, permissions ?? {}, tx);
        }

      } else {
        // Brand new agent — create fresh record
        agent = await this.createAgent.execute(
          {
            agencyId,
            agentId: request.userId,
            addedBy: approvedBy,
            roleInAgency,
            commissionRate,
            status: AgencyAgentStatus.active,
          },
          tx
        );

        // Add new permissions
        await this.addPermissions.execute(agent.id, agencyId, permissions ?? {}, tx);
      }

      // Update user role and status
      const updates: any = {};
      if (request.user?.role !== UserRole.agent) updates.role = UserRole.agent;
      if (request.user?.status !== UserStatus.active) updates.status = UserStatus.active;
      if (Object.keys(updates).length > 0) {
        await this.updateUserFields.execute(request.userId, updates, language, tx);
      }

      return agent;
    });

    const fullName = `${request.user?.firstName || ""} ${request.user?.lastName || ""}`.trim();
    // await this.queueService.sendAgentWelcomeEmail(request.user?.email || "", fullName);
     this.eventEmitter.emit(
      EMAIL_EVENTS.AGENT_WELCOME,
      new EmailAgentWelcomeEvent(request.user?.email || '', fullName),
    );

    await this.notificationService.sendNotification({
      userId: request.userId,
      type: 'agency_confirm_agent',
      metadata: { agencyId, approvedBy },
    });

    return agent;
  }
}