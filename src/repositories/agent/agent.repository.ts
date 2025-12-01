import { Injectable } from '@nestjs/common';
import {
  agencyagent,
  agencyagent_status,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AgentMapper } from '../../modules/agent/infrastructure/mappers/agent.mapper';
import { AgentWithUserAndPermission , AgentSort , CreateAgentDomainData , IAgentDomainRepository } from '../../modules/agent/domain/repositories/agents.repository.interface';
import { AgentEntity } from '../../modules/agent/domain/entities/agent.entity';
import { AgentStatus } from '../../modules/agent/domain/types/agent-status.type';
import { AgentRole } from '../../modules/agent/domain/types/agent-role.type';
import { AgentPermissionEntity } from '../../modules/agent/domain/entities/agent-permission.entity';

@Injectable()
export class AgentRepository implements IAgentDomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(agentId: number): Promise<AgentEntity | null> {
    const agent = await this.prisma.agencyagent.findUnique({
      where: { id: agentId },
    });
    return agent ? AgentMapper.toDomain(agent) : null;
  }

  async findAgencyIdByAgent(userId: number): Promise<number | null> {
    const agent = await this.prisma.agencyagent.findFirst({
      where: { agent_id: userId },
      select: { agency_id: true },
    });
    return agent ? agent.agency_id : null;
  }

 async findByAgencyAndAgent(
  agencyId: number,
  agentUserId: number,
): Promise<{ agent: AgentEntity; permission: AgentPermissionEntity | null } | null> {
  const result = await this.prisma.agencyagent.findUnique({
    where: {
      agency_id_agent_id: {
        agency_id: agencyId,
        agent_id: agentUserId,
      },
    },
    include: {
      permission: true,
    },
  });

  if (!result) return null;

  return {
    agent: AgentMapper.toDomain(result),
    permission: result.permission ? AgentMapper.toPermissionDomain(result.permission) : null,
  };
}

  async findByIdCardNumber(idCardNumber: string): Promise<string | null> {
    const result = await this.prisma.agencyagent.findUnique({
      where: { id_card_number: idCardNumber },
      select: { id_card_number: true },
    });
    return result?.id_card_number ?? null;
  }

  async findExistingAgent(agent_id: number): Promise<AgentEntity | null> {
    const result = await this.prisma.agencyagent.findFirst({
      where: { agent_id },
    });
    return result ? AgentMapper.toDomain(result) : null;
  }

  async createAgencyAgent(data: CreateAgentDomainData): Promise<AgentEntity> {
    const created = await this.prisma.agencyagent.create({
      data: {
        agency_id: data.agencyId,
        agent_id: data.agentId,
        added_by: data.addedBy ?? null,
        id_card_number: data.idCardNumber ?? null,
        role_in_agency: data.roleInAgency as any,
        commission_rate: data.commissionRate ?? null,
        start_date: new Date(),
        status: data.status as any,
      },
    });

    return AgentMapper.toDomain(created);
  }

  async getAgentWithPermissions(
    agencyAgentId: number,
  ): Promise<{ agent: AgentEntity; hasPermission: boolean } | null> {
    const result = await this.prisma.agencyagent.findUnique({
      where: { id: agencyAgentId },
      include: { permission: true, agency: true },
    });

    if (!result) return null;

    return {
      agent: AgentMapper.toDomain(result),
      hasPermission: !!result.permission,
    };
  }

  async getAgentsByAgency(
    agencyId: number,
    agentStatus: AgentStatus | undefined,
    limit: number,
    offset: number,
    showAllStatuses: boolean,
    search: string | undefined,
    sort: AgentSort,
  ): Promise<AgentWithUserAndPermission[]> {
    let orderBy: Prisma.agencyagentOrderByWithRelationInput = {};

    if (sort === 'name_asc' || sort === 'name_desc') {
      orderBy = {
        agentUser: {
          first_name: sort === 'name_asc' ? 'asc' : 'desc',
        },
      };
    } else if (sort === 'created_at_asc') {
      orderBy = { created_at: 'asc' };
    } else if (sort === 'created_at_desc') {
      orderBy = { created_at: 'desc' };
    }

    const results = await this.prisma.agencyagent.findMany({
      where: {
        agency_id: agencyId,
        ...(showAllStatuses ? {} : { status: agencyagent_status.active }),
        ...(agentStatus ? { status: agentStatus as any } : {}),
        ...(search
          ? {
              OR: [
                { agentUser: { username: { contains: search } } },
                { agentUser: { first_name: { contains: search } } },
                { agentUser: { last_name: { contains: search } } },
              ],
            }
          : {}),
      },
      include: {
        agentUser: true,
        permission: true,
      },
      orderBy,
      take: limit,
      skip: offset,
    });

    return results.map((r) =>
      AgentMapper.toAgentWithUserAndPermission({
        agencyagent: r,
        agentUser: r.agentUser,
        permission: r.permission!,
      }),
    );
  }

  async getAgentsCountByAgency(
    agencyId: number,
    showAllStatuses: boolean,
    search?: string,
    agentStatus?: AgentStatus,
  ): Promise<number> {
    return this.prisma.agencyagent.count({
      where: {
        agency_id: agencyId,
        ...(showAllStatuses ? {} : { status: agencyagent_status.active }),
        ...(agentStatus ? { status: agentStatus as any } : {}),
        ...(search
          ? {
              OR: [
                { agentUser: { is: { username: { contains: search } } } },
                { agentUser: { is: { first_name: { contains: search } } } },
                { agentUser: { is: { last_name: { contains: search } } } },
              ],
            }
          : {}),
      },
    });
  }

  async updateAgencyAgent(
    agencyAgentId: number,
    data: Partial<{
      id_card_number: string;
      role_in_agency: AgentRole;
      commission_rate: number;
      end_date: Date;
      status: AgentStatus;
    }>,
  ): Promise<AgentEntity> {
    const updated = await this.prisma.agencyagent.update({
      where: { id: agencyAgentId },
      data: {
        ...data,
        role_in_agency: data.role_in_agency as any,
        status: data.status as any,
      },
    });

    return AgentMapper.toDomain(updated);
  }
}