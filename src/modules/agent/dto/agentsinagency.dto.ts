import { agencyagent_role_in_agency, agencyagent_status } from '@prisma/client';

export class AgentUserDto {
  id: number;
  username: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  profile_img?: string | null;
  status: string;
}

export class AgentPermissionDto {
  id: number;
  agency_agent_id: number;
  agency_id: number;
  can_edit_own_post: boolean;
  can_edit_others_post: boolean;
  can_approve_requests: boolean;
  can_view_all_posts: boolean;
  can_delete_posts: boolean;
  can_manage_agents: boolean;
  created_at: Date;
  updated_at: Date | null;
}

export class AgentDto {
  id: number;
  agency_id: number;
  agent_id: number;
  added_by: number | null;
  id_card_number: string | null;
  role_in_agency: agencyagent_role_in_agency;
  commission_rate: number | null;
  start_date: Date | null;
  end_date: Date | null;
  status: agencyagent_status;
  created_at: Date;
  updated_at: Date | null;
  agentUser?: AgentUserDto;
  permission?: AgentPermissionDto | null;
}

// front-end specific

export class AgentUserForFrontEndDto {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_image: string | null;
}

export class AgentForFrontEndDto {
  id: number;
  role_in_agency: agencyagent_role_in_agency;
  status: agencyagent_status;
  created_at: string;
  agentUser: AgentUserForFrontEndDto | null;
}

export class AgentPaginationResponseDto {
  agents: AgentForFrontEndDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}