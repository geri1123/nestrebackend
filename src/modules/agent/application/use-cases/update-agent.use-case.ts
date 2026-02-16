import {
    Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupportedLang, t } from '../../../../locales';
import { UpdateAgentsDto } from '../../dto/update-agents.dto';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';
import {type IAgentDomainRepository } from '../../domain/repositories/agents.repository.interface';
import {
 type IAgentPermissionDomainRepository,
} from '../../domain/repositories/agent-permission.repository.interface';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationTemplateService } from '../../../notification/notifications-template.service';

import {
  AgencyAgentRoleInAgency,
  AgencyAgentStatus,
} from '@prisma/client';
import { hasAgentChanges, translateAgentChanges } from '../helpers/agent-change-translator';
import { AGENT_REPOSITORY_TOKENS } from '../../domain/repositories/agent.repository.tokens';


export interface BaseUserInfo {
  id: number;
  username: string;
}
@Injectable()
export class UpdateAgentUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,

    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY)
    private readonly agentPermissionRepo: IAgentPermissionDomainRepository,

    private readonly notificationService: NotificationService,
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  async execute(
    id: number,
    agencyId: number,
    dto: UpdateAgentsDto,
    language: SupportedLang,
    user: BaseUserInfo,
  ) {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throwValidationErrors(errors, language);
    }

    const existingAgent = await this.agentRepo.findById(id);
    if (!existingAgent) {
      throw new NotFoundException(t('userNotFound', language));
    }

    const existingPermissions =
      await this.agentPermissionRepo.getPermissionsByAgentId(id);

    const hasChangesFlag = hasAgentChanges(dto, {
      ...existingAgent,
      permissions: existingPermissions,
    });

    if (!hasChangesFlag) {
      return existingAgent;
    }

    const dataToUpdate: Partial<{
      role_in_agency: AgencyAgentRoleInAgency;
      commission_rate: number;
      end_date: Date;
      status: AgencyAgentStatus;
    }> = {
      ...(dto.role_in_agency !== undefined && {
        role_in_agency: dto.role_in_agency,
      }),
      ...(dto.commission_rate !== undefined && {
        commission_rate: dto.commission_rate,
      }),
      ...(dto.end_date !== undefined && { end_date: new Date(dto.end_date) }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    const updatedAgent = await this.agentRepo.updateAgencyAgent(id, dataToUpdate);

    if (dto.permissions) {
      if (existingPermissions) {
        await this.agentPermissionRepo.updatePermissions(id, dto.permissions);
      } else {
        await this.agentPermissionRepo.createPermissions(
          id,
          agencyId,
          dto.permissions,
        );
      }
    }

    
    
const changesText = translateAgentChanges(dto, language);

const updatedByName = user.username;

const translations = this.notificationTemplateService.getAllTranslations(
  'agent_updated_by_agent',
  {
    updatedByName,
    changesText,
  },
);

await this.notificationService.sendNotification({
  userId: updatedAgent.agentUserId,
  type: 'agent_updated_by_agent',
  translations,
});
    return {
      success: true,
      message: t('agentUpdatedSuccessfully', language),
    };
  }
}