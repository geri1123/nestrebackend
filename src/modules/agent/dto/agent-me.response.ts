import { ApiProperty } from '@nestjs/swagger';

export class AgentMeResponse {
  @ApiProperty({
    example: {
      id: 4,
      username: 'dawdawaadaswd',
      firstName: 'geri19',
      lastName: 'celmeta',
      profileImg: null,
    },
  })
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImg: string | null;
  };

  @ApiProperty({
    example: {
      agencyAgentId: 1,
      roleInAgency: 'agent',
      status: 'active',
      commissionRate: 10,
      startDate: '2025-12-17T17:28:49.846Z',
      endDate: '2025-12-31T23:59:59.000Z',
    },
  })
  agent: {
    agencyAgentId: number;
    roleInAgency: string;
    status: string;
    commissionRate: number | null;
    startDate: Date | null;
    endDate: Date | null;
  };

  @ApiProperty({
    example: {
      id: 1,
      name: 'dawdawdawdawd',
      logo: null,
    },
  })
  agency: {
    id: number;
    name: string;
    logo: string | null;
  };

  @ApiProperty({
    example: {
      canEditOwnPost: true,
      canEditOthersPost: false,
      canApproveRequests: false,
      canViewAllPosts: false,
      canDeletePosts: false,
      canManageAgents: false,
    },
    nullable: true,
  })
  permissions:
    | {
        canEditOwnPost: boolean;
        canEditOthersPost: boolean;
        canApproveRequests: boolean;
        canViewAllPosts: boolean;
        canDeletePosts: boolean;
        canManageAgents: boolean;
      }
    | null;

  @ApiProperty({
    example: {
      id: 2,
      username: 'dawdawdawd',
    },
    nullable: true,
  })
  addedBy?: {
    id: number;
    username: string;
  } | null;
}