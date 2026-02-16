import { Inject, Injectable } from "@nestjs/common";
import { AgentStatus } from "../../domain/types/agent-status.type";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";

@Injectable()
export class CountAgentsInAgencyUseCase {
  constructor(
 @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}
 async execute(
    agencyId: number,
    onlyActive = true,
    search?: string,
    agentStatus?: AgentStatus,
  ): Promise<number> {
    return this.agentRepo.getAgentsCountByAgency(
      agencyId,
      !onlyActive,  
      search,
      agentStatus,
    );
  }
}