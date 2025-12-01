import { Inject, Injectable } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentPermissionDomainRepository } from "../../domain/repositories/agent-permission.repository.interface";


@Injectable()
export class GetAgentPermissionsUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY)
    private readonly permissionRepo: IAgentPermissionDomainRepository,
  ) {}

  async execute(agentId: number) {
    return this.permissionRepo.getPermissionsByAgentId(agentId);
  }
}