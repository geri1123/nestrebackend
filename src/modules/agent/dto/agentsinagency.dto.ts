import { AgencyAgentRoleInAgency, AgencyAgentStatus } from '@prisma/client';

export class AgentUserDto {
  id!: number;
  username!: string;
  email!: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profileImg?: string | null;
  status!: string;
}

export class AgentPermissionDto {
  id!: number;
  agencyAgentId!: number;
  agencyId!: number;
  canEditOwnPost!: boolean;
        canEditOthersPost!: boolean;
        canApproveRequests!: boolean;
        canViewAllPosts!: boolean;
        canDeletePosts!: boolean;
        canManageAgents!: boolean;
  createdAt!: Date;
  updatedAt!: Date | null;
}

export class AgentDto {
  id!: number;
  agencyId!: number;
  agentId!: number;
  addedBy!: number | null;
  idCardNumber!: string | null;
  roleInAgency!: AgencyAgentRoleInAgency;
  commissionRate!: number | null;
  startDate!: Date | null;
  endDate!: Date | null;
  status!: AgencyAgentStatus;
  createdAt!: Date;
  updatedAt!: Date | null;
  agentUser?: AgentUserDto;
  permission?: AgentPermissionDto | null;
}

// front-end specific

export class AgentUserForFrontEndDto {
  id!: number;
  username!: string;
  email!: string;
  firstName!: string | null;
  lastName!: string | null;
  profileImage!: string | null;
}

export class AgentForFrontEndDto {
  id!: number;
  roleInAgency!: AgencyAgentRoleInAgency;
  status!: AgencyAgentStatus;
  createdAt!: string | null;
  agentUser!: AgentUserForFrontEndDto | null;
}
export class AgentPaginationResponseDto {
  agents!: AgentForFrontEndDto[];
  totalCount!: number;
  totalPages!: number;
  currentPage!: number;
}