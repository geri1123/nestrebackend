import { AgentPermissionEntity } from "../../domain/entities/agent-permission.entity";
import { AgentEntity } from "../../domain/entities/agent.entity";
import { AgentUserProps } from "../../domain/repositories/agents.repository.interface";
import { AgentMeResponse } from "../../dto/agent-me.response";

export function mapAgentToResponse(
  record: {
    agent: AgentEntity;
    agentUser: AgentUserProps;
    agency: { id: number; agency_name: string; logo: string | null };
    permission: AgentPermissionEntity | null;
      addedBy?: { id: number; username: string } | null;
  },

): AgentMeResponse {
  return {
    user: {
      id: record.agentUser.id,
      username: record.agentUser.username,
      firstName: record.agentUser.first_name,
      lastName: record.agentUser.last_name,
      profileImg: record.agentUser.profile_img        ? record.agentUser.profile_img
        : null,
    },
    agent: {
      agencyAgentId: record.agent.id,
      roleInAgency: record.agent.roleInAgency,
      status: record.agent.status,
      commissionRate: record.agent.commissionRate,
      startDate: record.agent.startDate,
      endDate: record.agent.endDate,
    },
    agency: {
      id: record.agency.id,
      name: record.agency.agency_name,
      logo: record.agency.logo
        ? record.agency.logo
        : null,
    },
    permissions: record.permission
      ? {
          canEditOwnPost: record.permission.canEditOwnPost,
          canEditOthersPost: record.permission.canEditOthersPost,
          canApproveRequests: record.permission.canApproveRequests,
          canViewAllPosts: record.permission.canViewAllPosts,
          canDeletePosts: record.permission.canDeletePosts,
          canManageAgents: record.permission.canManageAgents,
        }
      : null,
         addedBy: record.addedBy ?? null,
  };
}
