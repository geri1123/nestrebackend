import { AgentRole } from "../types/agent-role.type";
import { AgentStatus } from "../types/agent-status.type";

export interface CreateAgentDomainData {
  agencyId: number;
  agentId: number;
  addedBy?: number | null;
  idCardNumber?: string | null;
  roleInAgency: AgentRole;
  commissionRate?: number | null;
  status: AgentStatus;
}