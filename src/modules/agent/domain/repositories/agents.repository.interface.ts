import { AgentEntity } from '../entities/agent.entity';
import { AgentStatus } from '../types/agent-status.type';
import { AgentRole } from '../types/agent-role.type';
import { AgentPermissionEntity } from '../entities/agent-permission.entity';
import { agencyagent_role_in_agency, agencyagent_status, Prisma } from '@prisma/client';

// basic aggregate used in listing:
export interface AgentUserProps {
  id: number;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  profile_img: string | null;
  status: string;
}
export type AgentAddedByProps = {
  id: number;
  username: string;
};
export type AgentMeRecord = {
  agent: AgentEntity;
  agentUser: AgentUserProps;
  agency: {
    id: number;
    agency_name: string;
    logo: string | null;
  };
  permission: AgentPermissionEntity | null;
   addedBy?: AgentAddedByProps | null;
};

export interface AgentWithUserAndPermission {
  agent: AgentEntity;
  agentUser: AgentUserProps | null;
  permission: AgentPermissionEntity | null;
}
export type AgentSort =
  | 'name_asc'
  | 'name_desc'
  | 'created_at_desc'
  | 'created_at_asc';

export interface CreateAgentDomainData {
  agencyId: number;
  agentId: number;
  addedBy?: number | null;
  idCardNumber?: string | null;
  roleInAgency: AgentRole;
  commissionRate?: number | null;
  status: AgentStatus;
}

export interface IAgentDomainRepository {
  findById(agentId: number): Promise<AgentEntity | null>;

  findAgencyIdByAgent(userId: number): Promise<number | null>;
findByAgencyAndAgent(
  agencyId: number,
  agentUserId: number,
): Promise<{
  agent: AgentEntity;
  permission: AgentPermissionEntity | null;
} | null>;
  findByIdCardNumber(idCardNumber: string): Promise<string | null>;

  findExistingAgent(agentUserId: number): Promise<AgentEntity | null>;
getAgentAuthContext(userId: number): Promise<{
    agencyId: number;
    agencyAgentId: number;
    roleInAgency: agencyagent_role_in_agency;
    commissionRate:number | null;
    status: agencyagent_status;
    startDate:Date |null;
    
    updatedAt:Date | null;
    permissions: AgentPermissionEntity | null;
} | null>
  createAgencyAgent(data: CreateAgentDomainData ,tx?: Prisma.TransactionClient): Promise<AgentEntity>;

  getAgentWithPermissions(
    agencyAgentId: number,
  ): Promise<{ agent: AgentEntity; hasPermission: boolean } | null>;

  getAgentsByAgency(
    agencyId: number,
    status: AgentStatus | undefined,
    limit: number,
    offset: number,
    showAllStatuses: boolean,
    search: string | undefined,
    sort: AgentSort,
  ): Promise<AgentWithUserAndPermission[]>;

  getAgentsCountByAgency(
    agencyId: number,
    showAllStatuses: boolean,
    search: string | undefined,
    status: AgentStatus | undefined,
  ): Promise<number>;

  updateAgencyAgent(
    agencyAgentId: number,
    data: Partial<{
      id_card_number: string;
      role_in_agency: AgentRole;
      commission_rate: number;
      end_date: Date;
      status: AgentStatus;
    }>,
  ): Promise<AgentEntity>;
getAgentMe(
  userId: number,
): Promise<AgentMeRecord | null>;
getAgentByIdInAgency(
    agencyAgentId: number,
    agencyId: number,
  ): Promise<AgentMeRecord | null>;
}