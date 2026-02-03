import { AgentPermissionEntity } from '../../modules/agent/domain/entities/agent-permission.entity';
import { AgentPermissions } from '../types/permision.type';

export function mapAgentPermissions(
  entity: AgentPermissionEntity | null
): AgentPermissions {
  return {
    can_edit_own_post: entity?.canEditOwnPost ?? false,
    can_edit_others_post: entity?.canEditOthersPost ?? false,
    can_approve_requests: entity?.canApproveRequests ?? false,
    can_view_all_posts: entity?.canViewAllPosts ?? false,
    can_delete_posts: entity?.canDeletePosts ?? false,
    can_manage_agents: entity?.canManageAgents ?? false,
  };
}