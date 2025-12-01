import {
    Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupportedLang ,t } from '../../../../locales';
import { FilterAgentsDto } from '../../dto/filter-agents.dto';
import { AgentPaginationResponseDto } from '../../dto/agentsinagency.dto';
import {type IAgentDomainRepository } from '../../domain/repositories/agents.repository.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { agencyagent_status } from '@prisma/client';
import { formatDate } from '../../../../common/utils/date';
import { AGENT_REPOSITORY_TOKENS } from '../../domain/repositories/agent.repository.tokens';

@Injectable()
export class GetAgentsUseCase {
  constructor(
  @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(
    agencyId: number,
    page: number,
    limit: number,
    language: SupportedLang,
    filters: FilterAgentsDto,
    showAllStatuses = false,
    defaultStatus?: agencyagent_status,
  ): Promise<AgentPaginationResponseDto> {
    try {
      const offset = (page - 1) * limit;
      const { search, sort = 'created_at_desc', status } = filters;

      const finalStatus = defaultStatus ?? status;

      const [agentsPage, totalCount] = await Promise.all([
        this.agentRepo.getAgentsByAgency(
          agencyId,
          finalStatus as any,
          limit,
          offset,
          showAllStatuses,
          search,
          sort!,
        ),
        this.agentRepo.getAgentsCountByAgency(
          agencyId,
          showAllStatuses,
          search,
          finalStatus as any,
        ),
      ]);

      if (!agentsPage || agentsPage.length === 0) {
        return { agents: [], totalCount: 0, totalPages: 0, currentPage: page };
      }

      const agentsForFrontend = agentsPage.map((item) => ({
        id: item.agent.id,
        role_in_agency: item.agent.roleInAgency as any,
        status: item.agent.status as any,
        created_at: formatDate(item.agent.createdAt),
        agentUser: item.agentUser
          ? {
              id: item.agentUser.id,
              username: item.agentUser.username,
              email: item.agentUser.email,
              first_name: item.agentUser.first_name,
              last_name: item.agentUser.last_name,
              profile_image: item.agentUser.profile_img
                ? this.firebaseService.getPublicUrl(item.agentUser.profile_img)
                : null,
            }
          : null,
      }));

      return {
        agents: agentsForFrontend,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new InternalServerErrorException(t('somethingWentWrong', language));
    }
  }
}