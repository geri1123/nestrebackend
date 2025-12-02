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
        ...permissions,
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