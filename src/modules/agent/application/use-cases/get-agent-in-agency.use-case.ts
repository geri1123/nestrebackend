import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";
import { SupportedLang, t } from "../../../../locales";

@Injectable()
export class GetAgentByIdInAgencyUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(
    agencyAgentId: number,
    agencyId: number,
    lang: SupportedLang,
  ) {
    const record = await this.agentRepo.getAgentByIdInAgency(
      agencyAgentId,
      agencyId,
    );

    if (!record) {
      throw new NotFoundException(t('agentNotFound', lang));
    }

    return record;
  }
}