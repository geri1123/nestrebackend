// import { prisma } from "../../config/prisma.js";
import { Injectable } from "@nestjs/common";
import { NewAgent } from "../../agent/types/create-agent.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { IAgentsRepository } from "./Iagent.repository.js";
import { AgentInfo } from "../../agent/types/agent-info.js";

@Injectable()
export class AgentsRepository implements IAgentsRepository {
 constructor(private readonly prisma: PrismaService) {}
  async findAgentByUserId(userId: number): Promise<AgentInfo | null> {
  const agent = await this.prisma.agencyagent.findFirst({
    where: { agent_id: userId },
    select: {
      id: true,
      agent_id: true,
      agency_id: true,
      role_in_agency: true,
      id_card_number: true,
      status: true,
      commission_rate: true,
      start_date: true,
      end_date: true,
      created_at: true,
      updated_at: true, 
      agency: {
        select: {
          id: true,
          agency_name: true,
          logo: true,
          phone: true,
          website: true,
          status: true,
          public_code: true,
          agency_email: true,
          address: true,
          license_number: true,
          owner_user_id: true,  
          created_at: true,   
          updated_at: true,     
        },
      },
      addedByUser: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  if (!agent) return null;

  return {
    ...agent,
    commission_rate: agent.commission_rate !== null ? Number(agent.commission_rate) : undefined,
  } as AgentInfo;
}

  async create(agentData: NewAgent) {
    
    return await this.prisma.agencyagent.create({
      data: {
        agent_id: agentData.userId,
        agency_id: agentData.agency_id,
        added_by: agentData.added_by,
        id_card_number: agentData.id_card_number,
        role_in_agency: agentData.role_in_agency,
        status: agentData.status,
        commission_rate: agentData.commission_rate,
        start_date: agentData.start_date,
        end_date: agentData.end_date,
      },
    });
  }
}
