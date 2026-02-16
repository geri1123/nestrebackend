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
        canEditOwnPost: permissions.can_edit_own_post ?? true,
        canEditOthersPost: permissions.can_edit_others_post ?? false,
        canApproveRequests: permissions.can_approve_requests ?? false,
        canViewAllPosts: permissions.can_view_all_posts ?? false,
        canDeletePosts: permissions.can_delete_posts ?? false,
        canManageAgents: permissions.can_manage_agents ?? false,
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
      canEditOwnPost: permissions.can_edit_own_post,
      canEditOthersPost: permissions.can_edit_others_post,
      canApproveRequests: permissions.can_approve_requests,
      canViewAllPosts: permissions.can_view_all_posts,
      canDeletePosts: permissions.can_delete_posts,
      canManageAgents: permissions.can_manage_agents,
    },
  });

  return AgentMapper.toPermissionDomain(updated);
}

}