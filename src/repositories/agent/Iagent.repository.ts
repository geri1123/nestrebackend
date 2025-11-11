import { Createagentdata, NewAgent } from "../../modules/agent/types/create-agent.js";
import { AgentInfo } from "../../modules/agent/types/agent-info.js";
import { agencyagent, agencyagent_permission, agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
import { AgentDto } from "../../modules/agent/dto/agentsinagency.dto.js";
export interface IAgentsRepository {

findByIdCardNumber(
  idCardNumber: string
): Promise<{ id_card_number: string | null } | null> 
 findByAgencyAndAgent(agencyId: number, agentId: number): Promise<agencyagent | null>;
findAgencyIdByAgent(userId: number): Promise<number | null>
  createAgencyAgent(data: Createagentdata): Promise<NewAgent>
 findByIdCardNumber(
  idCardNumber: string
): Promise<{ id_card_number: string | null } | null>;
 findExistingAgent(agent_id: number): Promise<agencyagent | null>;
getAgentWithPermissions(agencyAgentId: number): Promise<
  (agencyagent & { permission: agencyagent_permission | null }) | null
>;
 getAgentsCountByAgency(
  agencyId: number,
  showAllStatuses: boolean ,
) :Promise<number>
   getAgentsByAgency(
  agencyId: number,
  agentStatus?: agencyagent_status,
): Promise<(agencyagent & { permission: agencyagent_permission | null, agentUser: any })[]>

}
