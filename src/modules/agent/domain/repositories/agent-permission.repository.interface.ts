import { Prisma } from '@prisma/client';
import { AgentPermissionEntity } from '../entities/agent-permission.entity';

export type AgentPermissionUpdateInput = Partial<{
  canEditOwnPost: boolean;
  canEditOthersPost: boolean;
  canApproveRequests: boolean;
  canViewAllPosts: boolean;
  canDeletePosts: boolean;
  canManageAgents: boolean;
}>;

export interface IAgentPermissionDomainRepository {
  getPermissionsByAgentId(
    agencyAgentId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AgentPermissionEntity | null>;

  createPermissions(
    agencyAgentId: number,
    agencyId: number,
    permissions: AgentPermissionUpdateInput,
     tx?: Prisma.TransactionClient,
  ): Promise<AgentPermissionEntity>;

  updatePermissions(
    agencyAgentId: number,
    permissions: AgentPermissionUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<AgentPermissionEntity>;
}