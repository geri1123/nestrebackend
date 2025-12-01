import { Inject, Injectable } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentDomainRepository } from "../../domain/repositories/agents.repository.interface";
import { CreateAgentDomainData } from "../../domain/types/create-agent.type";
@Injectable()
export class CreateAgentUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY)
    private readonly agentRepo: IAgentDomainRepository,
  ) {}

  async execute(data: CreateAgentDomainData) {
    return this.agentRepo.createAgencyAgent(data);
  }
}