export class AgentMeResponse {
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImg: string | null;
  };

  agent: {
    agencyAgentId: number;
    roleInAgency: string;
    status: string;
    commissionRate: number | null;
    startDate: Date | null;
    endDate: Date | null;
  };

  agency: {
    id: number;
    name: string;
    logo: string | null;
  };

  permissions: {
    canEditOwnPost: boolean;
    canEditOthersPost: boolean;
    canApproveRequests: boolean;
    canViewAllPosts: boolean;
    canDeletePosts: boolean;
    canManageAgents: boolean;
  } | null;


  addedBy?: {
    id: number;
    username: string;
  } | null;
}