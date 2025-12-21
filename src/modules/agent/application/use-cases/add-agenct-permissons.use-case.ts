
import { Inject, Injectable } from "@nestjs/common";
import { AGENT_REPOSITORY_TOKENS } from "../../domain/repositories/agent.repository.tokens";
import {type IAgentPermissionDomainRepository } from "../../domain/repositories/agent-permission.repository.interface";
import { Prisma } from "@prisma/client";

@Injectable()
export class AddAgentPermissionsUseCase {
  constructor(
    @Inject(AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY)
    private readonly permissionRepo: IAgentPermissionDomainRepository,
  ) {}
async execute(agentId: number, agencyId: number, permissions: any, tx?: Prisma.TransactionClient) {
  return this.permissionRepo.createPermissions(agentId, agencyId, permissions, tx);
}
 
}
