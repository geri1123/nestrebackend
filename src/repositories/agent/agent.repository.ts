// import { prisma } from "../../config/prisma.js";
import { Injectable } from "@nestjs/common";
import { Createagentdata, NewAgent } from "../../agent/types/create-agent";
import { PrismaService } from "../../prisma/prisma.service";
import { IAgentsRepository } from "./Iagent.repository";
import { AgentInfo } from "../../agent/types/agent-info";
import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";

@Injectable()
export class AgentsRepository implements IAgentsRepository {
 constructor(private readonly prisma: PrismaService) {}
//   async findAgentByUserId(userId: number): Promise<AgentInfo | null> {
//   const agent = await this.prisma.agencyagent.findFirst({
//     where: { agent_id: userId },
//     select: {
//       id: true,
//       agent_id: true,
//       agency_id: true,
//       role_in_agency: true,
//       id_card_number: true,
//       status: true,
//       commission_rate: true,
//       start_date: true,
//       end_date: true,
//       created_at: true,
//       updated_at: true, 
//       agency: {
//         select: {
//           id: true,
//           agency_name: true,
//           logo: true,
//           phone: true,
//           website: true,
//           status: true,
//           public_code: true,
//           agency_email: true,
//           address: true,
//           license_number: true,
//           owner_user_id: true,  
//           created_at: true,   
//           updated_at: true,     
//         },
//       },
//       addedByUser: {
//         select: {
//           id: true,
//           username: true,
//           email: true,
//         },
//       },
//     },
//   });

//   if (!agent) return null;

//   return {
//     ...agent,
//     commission_rate: agent.commission_rate !== null ? Number(agent.commission_rate) : undefined,
//   } as AgentInfo;
// }

  
  
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
  // async findByIdCardNumber(idCardNumber: string) {
  //   return await this.prisma.agencyagent.findUnique({
  //     where: { id_card_number: idCardNumber },
  //   });
  // }

}
