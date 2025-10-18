import type { AgencyInfo } from "../../agency/types/agency-info";

export type AgentInfo = {
  id: number;
  agent_id: number;
  agency_id: number;
  role_in_agency: 'agent' | 'senior_agent' | 'team_lead';
  id_card_number: string;
  status: 'active' | 'inactive' | 'terminated';
  commission_rate?: number;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at?: Date | null;
  agency: AgencyInfo;
  addedByUser?: {
    id: number;
    username: string;
    email: string;
  } | null;
};
