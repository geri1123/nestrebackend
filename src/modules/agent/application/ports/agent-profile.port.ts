import { AgencyAgentRoleInAgency } from '@prisma/client';
import { AgentStatus } from '../../domain/types/agent-status.type';
import { AgencyStatus } from '../../../agency/domain/types/agency-status.type';
import { AgentPermissions } from '../../../../common/types/permision.type';
 
export interface AgentProfileData {
  agencyAgentId: number;
  roleInAgency: AgencyAgentRoleInAgency;
  status: AgentStatus;
  commissionRate: number | null;
  startDate: Date | null;
  updatedAt: Date | null;
  permissions: AgentPermissions;
  agency: {
    id: number;
    name: string;
    email: string | null;
    logo: string | null;
    website: string | null;
    status: AgencyStatus;
    address: string;
    publicCode: string | null;
  };
}
 
export const AGENT_PROFILE_PORT = Symbol('AGENT_PROFILE_PORT');
 
export interface IAgentProfilePort {
  getAgentProfileData(userId: number, lang: string): Promise<AgentProfileData>;
}
 