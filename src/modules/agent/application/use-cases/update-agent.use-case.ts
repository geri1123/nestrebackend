import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupportedLang, t, SUPPORTED_LANGS } from '../../../../locales';
import { UpdateAgentsDto } from '../../dto/update-agents.dto';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';
import { type IAgentDomainRepository } from '../../domain/repositories/agents.repository.interface';
import { type IAgentPermissionDomainRepository } from '../../domain/repositories/agent-permission.repository.interface';
import { type IUserDomainRepository, USER_REPO } from '../../../users/domain/repositories/user.repository.interface';
import { type IAgencyDomainRepository } from '../../../agency/domain/repositories/agency.repository.interface';
import { type IProductRepository } from '../../../product/domain/repositories/product.repository.interface';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationTemplateService } from '../../../notification/notifications-template.service';
import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';
import { hasAgentChanges, translateAgentChanges } from '../helpers/agent-change-translator';
import { AGENT_REPOSITORY_TOKENS } from '../../domain/repositories/agent.repository.tokens';
import { AGENCY_REPO } from '../../../agency/domain/repositories/agency.repository.interface';
import { PRODUCT_REPO } from '../../../product/domain/repositories/product.repository.interface'; // token-i yt
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { UserEventPublisher } from '../../../users/application/events/user-event.publisher';

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

    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,

    @Inject(PRODUCT_REPO)
    private readonly productRepo: IProductRepository,

    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly notificationTemplateService: NotificationTemplateService,
     private readonly userEventPublisher: UserEventPublisher,
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
          // 1. Gjej ownerUserId nga agency
          const ownerUserId = await this.agencyRepo.findOwnerUserId(agencyId);

          if (!ownerUserId) {
            throw new NotFoundException(t('agencyOrOwnerNotFound', language));
          }

          // 2. Termino agjentin
          const agent = await this.agentRepo.updateAgencyAgent(id, dataToUpdate, tx);

          // 3. Ktheje rolin e userit te 'user'
          await this.userRepo.updateFields(agent.agentUserId, { role: 'user' }, tx);

          // 4. Transfero produktet e agjentit te pronari i agjencisë
          await this.productRepo.transferAgentProducts(
            agent.agentUserId,
            agencyId,
            ownerUserId,
            tx,
          );

          return agent;
        })
      : await this.agentRepo.updateAgencyAgent(id, dataToUpdate);
  if (dto.status === AgencyAgentStatus.terminated) {
      await this.userEventPublisher.userUpdated(updatedAgent.agentUserId);
    }
    if (dto.permissions) {
      if (existingPermissions) {
        await this.agentPermissionRepo.updatePermissions(id, dto.permissions);
      } else {
        await this.agentPermissionRepo.createPermissions(id, agencyId, dto.permissions);
      }
    }

    const updatedByName = user.username;

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