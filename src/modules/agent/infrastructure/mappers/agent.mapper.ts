import {
  AgencyAgent,
  AgencyAgentPermission,
  User,
} from '@prisma/client';
import { AgentEntity } from '../../domain/entities/agent.entity';
import { AgentPermissionEntity } from '../../domain/entities/agent-permission.entity';
import { AgentStatus } from '../../domain/types/agent-status.type';
import { AgentRole } from '../../domain/types/agent-role.type';
import { AgentUserProps ,AgentWithUserAndPermission} from '../../domain/repositories/agents.repository.interface';

export class AgentMapper {
  static toDomain(entity: AgencyAgent): AgentEntity {
    return new AgentEntity(
      entity.id,
      entity.agencyId,
      entity.agentId,
      entity.roleInAgency as AgentRole,
      entity.commissionRate !== null ? Number(entity.commissionRate) : null,
      entity.startDate ?? null,
      entity.endDate ?? null,
      entity.status as AgentStatus,
      entity.createdAt,
      entity.updatedAt ?? null,
    );
  }

 static toPermissionDomain(p: AgencyAgentPermission): AgentPermissionEntity {
  return new AgentPermissionEntity(
    p.id,
    p.agencyAgentId,
    p.agencyId,
    p.canEditOwnPost,
    p.canEditOthersPost,
    p.canApproveRequests,
    p.canViewAllPosts,
    p.canDeletePosts,
    p.canManageAgents,
    p.createdAt,
    p.updatedAt ?? null,
  );
}

  static toAgentUserProps(u: User): AgentUserProps {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName ?? null,
      lastName: u.lastName?? null,
      profileImg: u.profileImgUrl ?? null,
      status: u.status,
    };
  }

  static toAgentWithUserAndPermission(input: {
    agencyagent: AgencyAgent;
    agentUser: User | null;
    permission: AgencyAgentPermission | null;
  }): AgentWithUserAndPermission {
  return {
  agent: this.toDomain(input.agencyagent),
  agentUser: input.agentUser ? this.toAgentUserProps(input.agentUser) : null,
  permission: input.permission
    ? this.toPermissionDomain(input.permission)
    : null,
};
  }
}