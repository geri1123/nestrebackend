import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";
import { SupportedLang, t } from "../../../../locales";


@Injectable()
export class FindExistingAgentUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(agentId: number, language: SupportedLang) {
    const existing = await this.agentRepo.findExistingAgent(agentId);
    if (existing) {
      throw new BadRequestException({
        errors: { general: [t("agentExist", language)] },
      });
    }
    return existing;
  }
}