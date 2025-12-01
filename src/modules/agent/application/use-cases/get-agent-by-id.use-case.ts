import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";
import { SupportedLang , t } from "../../../../locales";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";

@Injectable()
export class GetAgentByIdUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(agentId: number, language: SupportedLang) {
    const agent = await this.agentRepo.findById(agentId);
    if (!agent) {
      throw new NotFoundException(t("userNotFound", language));
    }
    return agent;
  }
}