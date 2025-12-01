import { AgentRole } from '../types/agent-role.type';
import { AgentStatus } from '../types/agent-status.type';

export class AgentEntity {
  constructor(
    public readonly id: number,
    public readonly agencyId: number,
    public readonly agentUserId: number,
    public roleInAgency: AgentRole,
    public commissionRate: number | null,
    public startDate: Date | null,
    public endDate: Date | null,
    public status: AgentStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
  ) {}

  canBeUpdated(): boolean {
    return this.status !== 'terminated';
  }

  updateRole(newRole: AgentRole) {
    this.roleInAgency = newRole;
  }

  updateCommissionRate(rate: number | null) {
    if (rate !== null && rate < 0) {
      throw new Error('Commission rate cannot be negative');
    }
    this.commissionRate = rate;
  }

  updateStatus(newStatus: AgentStatus) {
    this.status = newStatus;
  }

  updateEndDate(endDate: Date | null) {
    this.endDate = endDate;
  }
}