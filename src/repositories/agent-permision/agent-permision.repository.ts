import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { agencyagent_permission } from "@prisma/client";

@Injectable()
export class AgentPermissionRepository {
  constructor(private prisma: PrismaService) {}

  // Get permissions of an agent by agency_agent_id
  async getPermissionsByAgentId(agencyAgentId: number): Promise<agencyagent_permission | null> {
    return this.prisma.agencyagent_permission.findUnique({
      where: { agency_agent_id: agencyAgentId },
    });
  }

  // Create permissions for an agent
  async createPermissions(
    agencyAgentId: number,
    agencyId: number,
    permissions: Partial<Omit<agencyagent_permission, "id" | "agency_agent_id" | "agency_id" | "created_at" | "updated_at">> // only pass boolean permissions
  ): Promise<agencyagent_permission> {
    return this.prisma.agencyagent_permission.create({
      data: {
        agency_agent_id: agencyAgentId,
        agency_id: agencyId,
        ...permissions,
      },
    });
  }

  // Update permissions for an existing agent
  async updatePermissions(
    agencyAgentId: number,
    permissions: Partial<Omit<agencyagent_permission, "id" | "agency_agent_id" | "agency_id" | "created_at" | "updated_at">>
  ): Promise<agencyagent_permission> {
    return this.prisma.agencyagent_permission.update({
      where: { agency_agent_id: agencyAgentId },
      data: { ...permissions },
    });
  }
}
