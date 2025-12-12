import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AGENT_REPOSITORY_TOKENS } from '../../domain/repositories/agent.repository.tokens';
import {type IAgentDomainRepository } from '../../domain/repositories/agents.repository.interface';
import { AgentMeResponse } from '../../dto/agent-me.response';
import { SupportedLang, t } from '../../../../locales';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { mapAgentToResponse } from '../../infrastructure/mappers/agent-response.mapper';

@Injectable()
export class GetAgentMeUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
    private readonly firebase: FirebaseService,
  ) {}

  async execute(
    userId: number,
    lang: SupportedLang,
  ): Promise<AgentMeResponse> {
    const record = await this.agentRepo.getAgentMe(userId);

    if (!record) {
      throw new NotFoundException(t('agentNotFound', lang));
    }

   
    return mapAgentToResponse(record, this.firebase);
  }
}