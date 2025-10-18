import type { BaseUserInfo } from './base-user-info';
import type { AgentInfo } from '../../agent/types/agent-info';
import type { AgencyInfo } from '../../agency/types/agency-info';

export type UserWithRoleInfo = BaseUserInfo & {
  agentInfo?: AgentInfo[];
  agencyInfo?: AgencyInfo | null;
};