import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { SupportedLang, t } from "../../../../locales";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";


@Injectable()
export class EnsureIdCardUniqueUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(idCardNumber: string, language: SupportedLang) {
    const existing = await this.agentRepo.findByIdCardNumber(idCardNumber);
    if (existing) {
      throw new BadRequestException({
        id_card_number: [t("idCardExists", language)],
      });
    }
  }
}