import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type Createagentdata = {
  agencyId: number;
  agentId: number;
  addedBy: number;
  idCardNumber: string;
  roleInAgency: agencyagent_role_in_agency;
  commissionRate?: number;
  status: agencyagent_status;
};
export type NewAgent = {
  agent_id: number;
  agency_id: number;
  added_by: number | null;
  id_card_number: string | null;
  role_in_agency:agencyagent_role_in_agency;
  status: agencyagent_status;
  commission_rate?: Decimal | null;
  start_date?: Date | null;
};