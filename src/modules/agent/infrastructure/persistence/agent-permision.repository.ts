import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { AgentPermissionUpdateInput, IAgentPermissionDomainRepository } from '../../domain/repositories/agent-permission.repository.interface';
import { AgentPermissionEntity } from '../../domain/entities/agent-permission.entity';
import { AgentMapper } from '../mappers/agent.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class AgentPermissionRepository
  implements IAgentPermissionDomainRepository
{
  constructor(private readonly prisma: PrismaService) {}
  async getPermissionsByAgentId(
    agencyAgentId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AgentPermissionEntity | null> {

    const client = tx ?? this.prisma;

    const result = await client.agencyAgentPermission.findUnique({
      where: { agencyAgentId: agencyAgentId },
    });

    return result ? AgentMapper.toPermissionDomain(result) : null;
  }

  async createPermissions(
    agencyAgentId: number,
    agencyId: number,
    permissions: AgentPermissionUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<AgentPermissionEntity> {
    
    const client = tx ?? this.prisma;

    const created = await client.agencyAgentPermission.create({
      data: {
        agencyAgentId: agencyAgentId,
        agencyId: agencyId,
        canEditOwnPost: permissions.canEditOwnPost ?? true,
        canEditOthersPost: permissions.canEditOthersPost ?? false,
        canApproveRequests: permissions.canApproveRequests ?? false,
        canViewAllPosts: permissions.canViewAllPosts ?? false,
        canDeletePosts: permissions.canDeletePosts ?? false,
        canManageAgents: permissions.canManageAgents ?? false,
      },
    });

    return AgentMapper.toPermissionDomain(created);
  }

async updatePermissions(
  agencyAgentId: number,
  permissions: AgentPermissionUpdateInput,
  tx?: Prisma.TransactionClient,
): Promise<AgentPermissionEntity> {

  const client = tx ?? this.prisma;

  const updated = await client.agencyAgentPermission.update({
    where: { agencyAgentId: agencyAgentId },
    data: {
      canEditOwnPost: permissions.canEditOwnPost,
      canEditOthersPost: permissions.canEditOthersPost,
      canApproveRequests: permissions.canApproveRequests,
      canViewAllPosts: permissions.canViewAllPosts,
      canDeletePosts: permissions.canDeletePosts,
      canManageAgents: permissions.canManageAgents,
    },
  });

  return AgentMapper.toPermissionDomain(updated);
}

}