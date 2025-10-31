import { NewAgent } from "../../agent/types/create-agent.js";
import { AgentInfo } from "../../agent/types/agent-info.js";
import { agencyagent, agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
export interface IAgentsRepository {

findByIdCardNumber(
  idCardNumber: string
): Promise<{ id_card_number: string | null } | null> 
createAgencyAgent(data: {
    agencyId: number;
    agentId: number;
    addedBy: number;
    idCardNumber: string;
    roleInAgency: agencyagent_role_in_agency;
    commissionRate?: number;
    startDate: Date;
    endDate?: Date;
    status: agencyagent_status;
  });
  //  findByIdCardNumber(idCardNumber: string);
  // findAgentByUserId(userId: number): Promise<AgentInfo | null>;
}
