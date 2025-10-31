import { Decimal } from "@prisma/client/runtime/library";

export type NewAgent = {
  agent_id: number;
  agency_id: number;
  added_by: number | null;
  id_card_number: string | null;
  role_in_agency: "agent" | "senior_agent" | "team_lead";
  status: 'active' | 'inactive'|'terminated';
  commission_rate?: Decimal | null;
  start_date?: Date | null;
};