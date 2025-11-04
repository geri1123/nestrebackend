// import { prisma } from "../../config/prisma.js";
import { Injectable } from "@nestjs/common";
import { Createagentdata, NewAgent } from "../../agent/types/create-agent";
import { PrismaService } from "../../prisma/prisma.service";
import { IAgentsRepository } from "./Iagent.repository";
import { AgentInfo } from "../../agent/types/agent-info";
import { agencyagent, agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";

@Injectable()
export class AgentsRepository implements IAgentsRepository {
 constructor(private readonly prisma: PrismaService) {}

   async findAgencyIdByAgent(userId: number): Promise<number | null> {
    const agent = await this.prisma.agencyagent.findFirst({
      where: { agent_id: userId },
      select: { agency_id: true }, 
    });

   
    return agent ? agent.agency_id : null;
  }

  
   async createAgencyAgent(data: Createagentdata): Promise<NewAgent> {
    // create the agent in the database
    const agent = await this.prisma.agencyagent.create({
      data: {
        agency_id: data.agencyId,
        agent_id: data.agentId,
        added_by: data.addedBy,
        id_card_number: data.idCardNumber,
        role_in_agency: data.roleInAgency,
        commission_rate: data.commissionRate,
        start_date: new Date(),
        
        status: data.status,
      },
      select: {
        agent_id: true,
        agency_id: true,
        added_by: true,
        id_card_number: true,
        role_in_agency: true,
        status: true,
        commission_rate: true,
        start_date: true,
      },
    });

   
    return agent;
  }
async findByIdCardNumber(
  idCardNumber: string
): Promise<{ id_card_number: string | null } | null> {
  return this.prisma.agencyagent.findUnique({
    where: { id_card_number: idCardNumber },
    select: { id_card_number: true },
  });
}
async findExistingAgent(agent_id: number): Promise<agencyagent | null> {
  return await this.prisma.agencyagent.findFirst({
    where: { agent_id },  // Find the first agencyagent with the given agent_id
  });
}
}



  // async findByIdCardNumber(idCardNumber: string) {
  //   return await this.prisma.agencyagent.findUnique({
  //     where: { id_card_number: idCardNumber },
  //   });
  // }

