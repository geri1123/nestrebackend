import { Inject, Injectable } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";


@Injectable()
export class GetAgencyIdForAgentUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(agentId: number): Promise<number | null> {
    return this.agentRepo.findAgencyIdByAgent(agentId);
  }
}