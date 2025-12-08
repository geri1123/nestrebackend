import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { AgentPermissionUpdateInput, IAgentPermissionDomainRepository } from '../../domain/repositories/agent-permission.repository.interface';
import { AgentPermissionEntity } from '../../domain/entities/agent-permission.entity';
import { AgentMapper } from '../mappers/agent.mapper';

@Injectable()
export class AgentPermissionRepository
  implements IAgentPermissionDomainRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async getPermissionsByAgentId(
    agencyAgentId: number,
  ): Promise<AgentPermissionEntity | null> {
    const result = await this.prisma.agencyagent_permission.findUnique({
      where: { agency_agent_id: agencyAgentId },
    });

    return result ? AgentMapper.toPermissionDomain(result) : null;
  }

  async createPermissions(
  agencyAgentId: number,
  agencyId: number,
  permissions: AgentPermissionUpdateInput,
): Promise<AgentPermissionEntity> {
  const created = await this.prisma.agencyagent_permission.create({
    data: {
      agency_agent_id: agencyAgentId,
      agency_id: agencyId,
      // Explicitly set each field with defaults from your schema
      can_edit_own_post: permissions.can_edit_own_post ?? true,
      can_edit_others_post: permissions.can_edit_others_post ?? false,
      can_approve_requests: permissions.can_approve_requests ?? false,
      can_view_all_posts: permissions.can_view_all_posts ?? false,
      can_delete_posts: permissions.can_delete_posts ?? false,
      can_manage_agents: permissions.can_manage_agents ?? false,
    },
  });

  return AgentMapper.toPermissionDomain(created);
}
  async updatePermissions(
    agencyAgentId: number,
    permissions: AgentPermissionUpdateInput,
  ): Promise<AgentPermissionEntity> {
    const updated = await this.prisma.agencyagent_permission.update({
      where: { agency_agent_id: agencyAgentId },
      data: { ...permissions },
    });

    return AgentMapper.toPermissionDomain(updated);
  }
}