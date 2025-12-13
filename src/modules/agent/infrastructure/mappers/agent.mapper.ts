import {
  agencyagent,
  agencyagent_permission,
  user,
} from '@prisma/client';
import { AgentEntity } from '../../domain/entities/agent.entity';
import { AgentPermissionEntity } from '../../domain/entities/agent-permission.entity';
import { AgentStatus } from '../../domain/types/agent-status.type';
import { AgentRole } from '../../domain/types/agent-role.type';
import { AgentUserProps ,AgentWithUserAndPermission} from '../../domain/repositories/agents.repository.interface';

export class AgentMapper {
  static toDomain(entity: agencyagent): AgentEntity {
    return new AgentEntity(
      entity.id,
      entity.agency_id,
      entity.agent_id,
      entity.role_in_agency as AgentRole,
      entity.commission_rate !== null ? Number(entity.commission_rate) : null,
      entity.start_date ?? null,
      entity.end_date ?? null,
      entity.status as AgentStatus,
      entity.created_at,
      entity.updated_at ?? null,
    );
  }

 static toPermissionDomain(p: agencyagent_permission): AgentPermissionEntity {
  return new AgentPermissionEntity(
    p.id,
    p.agency_agent_id,
    p.agency_id,
    p.can_edit_own_post,
    p.can_edit_others_post,
    p.can_approve_requests,
    p.can_view_all_posts,
    p.can_delete_posts,
    p.can_manage_agents,
    p.created_at,
    p.updated_at ?? null,
  );
}

  static toAgentUserProps(u: user): AgentUserProps {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      first_name: u.first_name ?? null,
      last_name: u.last_name ?? null,
      profile_img: u.profile_img_url ?? null,
      status: u.status,
    };
  }

  static toAgentWithUserAndPermission(input: {
    agencyagent: agencyagent;
    agentUser: user | null;
    permission: agencyagent_permission | null;
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