//fix this tomorrow with transaction

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
    try {
      console.log('=== START ApproveAgencyRequestUseCase ===');
      const { request, agencyId, approvedBy, roleInAgency, commissionRate, permissions } = input;

      console.log('Input data:', {
        userId: request.userId,
        agencyId,
        approvedBy,
        roleInAgency,
        commissionRate,
        permissions,
        hasUser: !!request.user,
        userEmail: request.user?.email,
      });

      // Check if agent already exists
      console.log('Step 1: Checking if agent exists...');
      await this.findExistingAgent.execute(request.userId, language);
      console.log('Agent existence check passed');

      // Create agent
      console.log('Step 2: Creating agent...');
      const agent = await this.createAgent.execute({
        agencyId,
        agentId: request.userId,
        addedBy: approvedBy,
        idCardNumber: request.idCardNumber || null,
        roleInAgency,
        commissionRate,
        status: "active",
      });
      console.log('Agent created:', { agentId: agent.id });

      // Update user fields if needed
      console.log('Step 3: Updating user fields...');
      const updates: any = {};
      if (request.user?.role !== user_role.agent) {
        updates.role = user_role.agent;
      }
      if (request.user?.status !== user_status.active) {
        updates.status = user_status.active;
      }

      console.log('User updates needed:', updates);

      if (Object.keys(updates).length > 0) {
        await this.updateUserFields.execute(request.userId, updates);
        console.log('User fields updated');
      } else {
        console.log('No user updates needed');
      }

      // Add permissions
      console.log('Step 4: Adding permissions...');
      console.log('Permissions to add:', permissions);
      
      await this.addPermissions.execute(
        agent.id,
        agencyId,
        permissions && Object.keys(permissions).length > 0 ? permissions : {}
      );
      console.log('Permissions added successfully');

      // Send welcome email
      console.log('Step 5: Sending welcome email...');
      const fullName = `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim();
      console.log('Email details:', {
        email: request.user?.email,
        name: fullName,
      });

      await this.emailService.sendAgentWelcomeEmail(
        request.user?.email || "",
        fullName
      );
      console.log('Welcome email sent');

      console.log('=== END ApproveAgencyRequestUseCase SUCCESS ===');
      return agent;
    } catch (error) {
      console.error('=== ERROR in ApproveAgencyRequestUseCase ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}