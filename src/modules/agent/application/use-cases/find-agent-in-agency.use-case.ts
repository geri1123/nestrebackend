import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import { SupportedLang, t } from "../../../../locales";


@Injectable()
export class FindAgentInAgencyUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(agencyId: number, agentUserId: number, lang: SupportedLang) {
    const record = await this.agentRepo.findByAgencyAndAgent(agencyId, agentUserId);

    if (!record) {
      throw new NotFoundException(t("userNotFound", lang));
    }

    return record; 
  }
}