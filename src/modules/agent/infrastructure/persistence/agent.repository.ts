import { Injectable } from '@nestjs/common';
import {
  
  AgencyAgentRoleInAgency,
  AgencyAgentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { AgentMapper } from '../mappers/agent.mapper';
import { AgentWithUserAndPermission , AgentSort , CreateAgentDomainData , IAgentDomainRepository, AgentUserProps, AgentMeRecord } from '../../domain/repositories/agents.repository.interface';
import { AgentEntity } from '../../domain/entities/agent.entity';
import { AgentStatus } from '../../domain/types/agent-status.type';
import { AgentRole } from '../../domain/types/agent-role.type';
import { AgentPermissionEntity } from '../../domain/entities/agent-permission.entity';

@Injectable()
export class AgentRepository implements IAgentDomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(agentId: number): Promise<AgentEntity | null> {
    const agent = await this.prisma.agencyAgent.findUnique({
      where: { id: agentId },
    });
    return agent ? AgentMapper.toDomain(agent) : null;
  }

  async findAgencyIdByAgent(userId: number): Promise<number | null> {
    const agent = await this.prisma.agencyAgent.findFirst({
      where: { agentId: userId },
      select: { agencyId: true },
    });
    return agent ? agent.agencyId : null;
  }

  async findByAgencyAndAgent(
    agencyId: number,
    agentUserId: number,
  ): Promise<{ agent: AgentEntity; permission: AgentPermissionEntity | null } | null> {
    const result = await this.prisma.agencyAgent.findUnique({
      where: {
        agencyId_agentId: {
          agencyId: agencyId,
          agentId: agentUserId,
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

  async getAgentAuthContext(userId: number): Promise<{
    agencyId: number;
    agencyAgentId: number;
    roleInAgency: AgencyAgentRoleInAgency;
    commissionRate: number | null;
    status: AgencyAgentStatus;
    startDate: Date | null;
    updatedAt: Date | null;
    permissions: AgentPermissionEntity | null;
  } | null> {
    const record = await this.prisma.agencyAgent.findFirst({
      where: { agentId: userId },
      include: { permission: true },
    });

    if (!record) return null;

    return {
      agencyId: record.agencyId,
      agencyAgentId: record.id,
      roleInAgency: record.roleInAgency,
      status: record.status,
      commissionRate: record.commissionRate ? record.commissionRate.toNumber() : null,
      startDate: record.startDate ? record.startDate : null,
      updatedAt: record.updatedAt ? record.updatedAt : null,
      permissions: record.permission
        ? AgentMapper.toPermissionDomain(record.permission)
        : null,
    };
  }

  async findByIdCardNumber(idCardNumber: string): Promise<string | null> {
    const result = await this.prisma.agencyAgent.findUnique({
      where: { idCardNumber: idCardNumber },
      select: { idCardNumber: true },
    });
    return result?.idCardNumber ?? null;
  }

  async findExistingAgent(agent_id: number): Promise<AgentEntity | null> {
    const result = await this.prisma.agencyAgent.findFirst({
      where: { agentId: agent_id },
    });
    return result ? AgentMapper.toDomain(result) : null;
  }

  async createAgencyAgent(
    data: CreateAgentDomainData,
    tx?: Prisma.TransactionClient,
  ): Promise<AgentEntity> {
    const client = tx ?? this.prisma;

    const created = await client.agencyAgent.create({
      data: {
        agencyId: data.agencyId,
        agentId: data.agentId,
        addedBy: data.addedBy ?? null,
        idCardNumber: data.idCardNumber ?? null,
        roleInAgency: data.roleInAgency as any,
        commissionRate: data.commissionRate ?? null,
        startDate: new Date(),
        status: data.status as any,
      },
    });

    return AgentMapper.toDomain(created);
  }

  async getAgentWithPermissions(
    agencyAgentId: number,
  ): Promise<{ agent: AgentEntity; hasPermission: boolean } | null> {
    const result = await this.prisma.agencyAgent.findUnique({
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
    let orderBy: Prisma.AgencyAgentOrderByWithRelationInput = {};

    if (sort === 'name_asc' || sort === 'name_desc') {
      orderBy = {
        agentUser: {
          firstName: sort === 'name_asc' ? 'asc' : 'desc',
        },
      };
    } else if (sort === 'created_at_asc') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'created_at_desc') {
      orderBy = { createdAt: 'desc' };
    }

    const results = await this.prisma.agencyAgent.findMany({
      where: {
        agencyId: agencyId,
        ...(showAllStatuses ? {} : { status: AgencyAgentStatus.active }),
        ...(agentStatus ? { status: agentStatus as any } : {}),
        ...(search
          ? {
              OR: [
                { agentUser: { username: { contains: search } } },
                { agentUser: { firstName: { contains: search } } },
                { agentUser: { lastName: { contains: search } } },
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
    return this.prisma.agencyAgent.count({
      where: {
        agencyId: agencyId,
        ...(showAllStatuses ? {} : { status: AgencyAgentStatus.active }),
        ...(agentStatus ? { status: agentStatus as any } : {}),
        ...(search
          ? {
              OR: [
                { agentUser: { is: { username: { contains: search } } } },
                { agentUser: { is: { firstName: { contains: search } } } },
                { agentUser: { is: { lastName: { contains: search } } } },
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
    // Map snake_case to camelCase for Prisma
    const prismaData: any = {};
    
    if (data.id_card_number !== undefined) prismaData.idCardNumber = data.id_card_number;
    if (data.role_in_agency !== undefined) prismaData.roleInAgency = data.role_in_agency as any;
    if (data.commission_rate !== undefined) prismaData.commissionRate = data.commission_rate;
    if (data.end_date !== undefined) prismaData.endDate = data.end_date;
    if (data.status !== undefined) prismaData.status = data.status as any;

    const updated = await this.prisma.agencyAgent.update({
      where: { id: agencyAgentId },
      data: prismaData,
    });

    return AgentMapper.toDomain(updated);
  }

  async getAgentMe(
    userId: number,
  ): Promise<AgentMeRecord | null> { 
    const record = await this.prisma.agencyAgent.findFirst({
      where: {
        agentId: userId,
        status: 'active',
        agency: { status: 'active' },
      },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            logo: true,
          },
        },
        agentUser: true,
        permission: true,
        addedByUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!record || !record.agentUser || !record.agency) {
      return null;
    }

    return {
      agent: AgentMapper.toDomain(record),
      agentUser: AgentMapper.toAgentUserProps(record.agentUser),
      agency: {
        id: record.agency.id,
        agency_name: record.agency.agencyName,
        logo: record.agency.logo,
      },
      permission: record.permission
        ? AgentMapper.toPermissionDomain(record.permission)
        : null,
      addedBy: record.addedByUser
        ? {
            id: record.addedByUser.id,
            username: record.addedByUser.username,
          }
        : null,
    };
  }

  async getAgentByIdInAgency(
    agencyAgentId: number,
    agencyId: number,
  ): Promise<AgentMeRecord | null> {
    const record = await this.prisma.agencyAgent.findFirst({
      where: {
        id: agencyAgentId,
        agencyId: agencyId,
        status: 'active',
        agency: { status: 'active' },
      },
      include: {
        agency: {
          select: {
            id: true,
            agencyName: true,
            logo: true,
          },
        },
        agentUser: true,
        permission: true,
        addedByUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!record || !record.agentUser || !record.agency) {
      return null;
    }

    return {
      agent: AgentMapper.toDomain(record),
      agentUser: AgentMapper.toAgentUserProps(record.agentUser),
      agency: {
        id: record.agency.id,
        agency_name: record.agency.agencyName,
        logo: record.agency.logo,
      },
      permission: record.permission
        ? AgentMapper.toPermissionDomain(record.permission)
        : null,
      addedBy: record.addedByUser
        ? {
            id: record.addedByUser.id,
            username: record.addedByUser.username,
          }
        : null,
    };
  }
}