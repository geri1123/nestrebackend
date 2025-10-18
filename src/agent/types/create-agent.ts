export type NewAgent = {
  userId: number;
  agency_id: number;
  added_by: number;
  id_card_number: string | null;
  role_in_agency: "agent" | "senior_agent" | "team_lead";
  status: 'active' | 'inactive'|'terminated';
  commission_rate?: number;
  start_date?: Date;
  end_date?: Date | null;
};