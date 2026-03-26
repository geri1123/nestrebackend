

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupportedLang, t } from '../../../../locales';
import { UpdateAgentsDto } from '../../dto/update-agents.dto';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';
import { type IAgentDomainRepository } from '../../domain/repositories/agents.repository.interface';
import { type IAgentPermissionDomainRepository } from '../../domain/repositories/agent-permission.repository.interface';
import { type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { USER_REPO } from '../../../users/domain/repositories/user.repository.interface';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationTemplateService } from '../../../notification/notifications-template.service';
import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';
import { hasAgentChanges, translateAgentChanges } from '../helpers/agent-change-translator';
import { AGENT_REPOSITORY_TOKENS } from '../../domain/repositories/agent.repository.tokens';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { SUPPORTED_LANGS } from '../../../../locales';
export interface BaseUserInfo {
  id: number;
  username: string;
}

@Injectable()
export class UpdateAgentUseCase {

  private readonly ROLE_HIERARCHY: Record<AgencyAgentRoleInAgency, number> = {
    agent:        1,
    senior_agent: 2,
    team_lead:    3,
  };

  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,

    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY)
    private readonly agentPermissionRepo: IAgentPermissionDomainRepository,

    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,

    private readonly prisma: PrismaService,

    private readonly notificationService: NotificationService,
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  async execute(
    id: number,
    agencyId: number,
    dto: UpdateAgentsDto,
    language: SupportedLang,
    user: BaseUserInfo,
    actingAgentId?: number,
  ) {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throwValidationErrors(errors, language);
    }

    const [existingAgent, actingAgent] = await Promise.all([
      this.agentRepo.findById(id),
      actingAgentId ? this.agentRepo.findById(actingAgentId) : Promise.resolve(null),
    ]);

    if (!existingAgent) {
      throw new NotFoundException(t('userNotFound', language));
    }

    if (existingAgent.status === AgencyAgentStatus.terminated) {
      throw new ForbiddenException(t('cannotUpdateTerminatedAgent', language));
    }

    if (actingAgentId && actingAgentId === id) {
      throw new ForbiddenException(t('cannotUpdateOwnAgent', language));
    }

    if (actingAgentId && actingAgent) {
      const actingRank = this.ROLE_HIERARCHY[actingAgent.roleInAgency];
      const targetRank = this.ROLE_HIERARCHY[existingAgent.roleInAgency];

      if (targetRank >= actingRank) {
        throw new ForbiddenException(t('cannotUpdateHigherOrEqualRole', language));
      }

      if (dto.roleInAgency !== undefined && this.ROLE_HIERARCHY[dto.roleInAgency] >= actingRank) {
        throw new ForbiddenException(t('cannotAssignHigherOrEqualRole', language));
      }
    }

    const existingPermissions = await this.agentPermissionRepo.getPermissionsByAgentId(id);

    const hasChangesFlag = hasAgentChanges(dto, {
      ...existingAgent,
      permissions: existingPermissions,
    });

    if (!hasChangesFlag) {
      return existingAgent;
    }

    const dataToUpdate: Partial<{
      roleInAgency: AgencyAgentRoleInAgency;
      commissionRate: number;
      endDate: Date;
      status: AgencyAgentStatus;
    }> = {
      ...(dto.roleInAgency !== undefined && { roleInAgency: dto.roleInAgency }),
      ...(dto.commissionRate !== undefined && { commissionRate: dto.commissionRate }),
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

const updatedAgent = dto.status === AgencyAgentStatus.terminated
  ? await this.prisma.$transaction(async (tx) => {
      const agent = await this.agentRepo.updateAgencyAgent(id, dataToUpdate, tx);
      await this.userRepo.updateFields(agent.agentUserId, { role: 'user' }, tx);
      await this.agentRepo.detachAgentProducts(agent.agentUserId, agencyId, tx);
      return agent;
    })
  : await this.agentRepo.updateAgencyAgent(id, dataToUpdate);

    if (dto.permissions) {
      if (existingPermissions) {
        await this.agentPermissionRepo.updatePermissions(id, dto.permissions);
      } else {
        await this.agentPermissionRepo.createPermissions(id, agencyId, dto.permissions);
      }
    }

    const changesText = translateAgentChanges(dto, language);
    const updatedByName = user.username;

    // const translations = this.notificationTemplateService.getAllTranslations(
    //   'agent_updated_by_agent',
    //   { updatedByName, changesText },
    // );
const translations = SUPPORTED_LANGS.map((lang) => {
  const changesText = translateAgentChanges(dto, lang, existingAgent);
  const message = this.notificationTemplateService.getTemplate(
    'agent_updated_by_agent',
    { updatedByName, changesText },
    lang,
  );
  return { languageCode: lang, message };
});
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