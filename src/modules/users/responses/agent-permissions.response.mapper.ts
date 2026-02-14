import { AgentPermissions } from '../../../common/types/permision.type';
import { AgentPermissionsResponse } from './types/agent-permissions.response.type';


export function mapPermissionsToResponse(
  permissions: AgentPermissions,
): AgentPermissionsResponse {
  return {
    canEditOwnPost: permissions.can_edit_own_post,
    canEditOthersPost: permissions.can_edit_others_post,
    canApproveRequests: permissions.can_approve_requests,
    canViewAllPosts: permissions.can_view_all_posts,
    canDeletePosts: permissions.can_delete_posts,
    canManageAgents: permissions.can_manage_agents,
  };
}