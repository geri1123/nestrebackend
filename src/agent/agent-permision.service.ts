import { Injectable } from "@nestjs/common";
import { AgentPermissionRepository } from "../repositories/agent-permision/agent-permision.repository";
import { agencyagent_permission } from "@prisma/client";

@Injectable()
export class AgentPermisionService {
  constructor(private readonly agentpermisionRepo: AgentPermissionRepository) {}

  
  async getPermissions(agentId: number): Promise<agencyagent_permission | null> {
    return this.agentpermisionRepo.getPermissionsByAgentId(agentId);
  }

  
  async addPermissions(
    agentId: number,
    agencyId: number,
    permissions: Partial<Omit<agencyagent_permission, 'id' | 'agency_agent_id' | 'agency_id' | 'created_at' | 'updated_at'>>
  ): Promise<agencyagent_permission> {
    return this.agentpermisionRepo.createPermissions(agentId, agencyId, permissions);
  }

 
  async updatePermissions(
    agentId: number,
    permissions: Partial<Omit<agencyagent_permission, 'id' | 'agency_agent_id' | 'agency_id' | 'created_at' | 'updated_at'>>
  ): Promise<agencyagent_permission> {
    return this.agentpermisionRepo.updatePermissions(agentId, permissions);
  }
}
