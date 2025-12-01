import { AgentPermissionEntity } from '../entities/agent-permission.entity';

export type AgentPermissionUpdateInput = Partial<{
  can_edit_own_post: boolean;
  can_edit_others_post: boolean;
  can_approve_requests: boolean;
  can_view_all_posts: boolean;
  can_delete_posts: boolean;
  can_manage_agents: boolean;
}>;

export interface IAgentPermissionDomainRepository {
  getPermissionsByAgentId(
    agencyAgentId: number,
  ): Promise<AgentPermissionEntity | null>;

  createPermissions(
    agencyAgentId: number,
    agencyId: number,
    permissions: AgentPermissionUpdateInput,
  ): Promise<AgentPermissionEntity>;

  updatePermissions(
    agencyAgentId: number,
    permissions: AgentPermissionUpdateInput,
  ): Promise<AgentPermissionEntity>;
}