import { NewAgent } from "../../agent/types/create-agent.js";
import { AgentInfo } from "../../agent/types/agent-info.js";
export interface IAgentsRepository {
  create(agentData: NewAgent): Promise<any>;  
  findAgentByUserId(userId: number): Promise<AgentInfo | null>;
}
