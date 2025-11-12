// import { prisma } from "../../config/prisma.js";
import { Injectable } from "@nestjs/common";
import { Createagentdata, NewAgent } from "../../modules/agent/types/create-agent";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { IAgentsRepository } from "./Iagent.repository";
import { AgentInfo } from "../../modules/agent/types/agent-info";
import { agencyagent, agencyagent_permission, agencyagent_role_in_agency, agencyagent_status, Prisma } from "@prisma/client";
import { AgentPermissions } from "../../common/types/permision.type";
import { AgentDto } from "../../modules/agent/dto/agentsinagency.dto";

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
async findByAgencyAndAgent(
  agencyId: number,
  agentId: number
): Promise<(agencyagent & { permission: any }) | null> {
  return this.prisma.agencyagent.findUnique({
    where: {
      agency_id_agent_id: {
        agency_id: agencyId,
        agent_id: agentId,
      },
    },
    include: {
      permission: true, 
    },
  });
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
        id:true,
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
    where: { agent_id },  
  });
}

  async getAgentWithPermissions(
    agencyAgentId: number,
  ): Promise<Prisma.agencyagentGetPayload<{ include: { permission: true , agency: true } }> | null> {
    return this.prisma.agencyagent.findUnique({
      where: { id: agencyAgentId },
      include: { 
        permission: true ,
          agency: true,
      },
    });
  }

  async getAgentsByAgency(
  agencyId: number,
  agentStatus?: agencyagent_status,
  limit?: number,
  offset?: number,
  showAllStatuses: boolean = false,
  search?: string,
  sort: 'name_asc' | 'name_desc' | 'created_at_desc' | 'created_at_asc' = 'created_at_desc',
) {
  // figure out Prisma orderBy based on sort option
  let orderBy: any = {};

  if (sort === 'name_asc') {
    orderBy = { agentUser: { first_name: 'asc' } };
  } else if (sort === 'name_desc') {
    orderBy = { agentUser: { first_name: 'desc' } };
  } else if (sort === 'created_at_asc') {
    orderBy = { created_at: 'asc' };
  } else if (sort === 'created_at_desc') {
    orderBy = { created_at: 'desc' };
  }

  return this.prisma.agencyagent.findMany({
    where: {
      agency_id: agencyId,
      ...(showAllStatuses ? {} : { status: 'active' }),
      ...(agentStatus ? { status: agentStatus } : {}),
      ...(search
        ? {
            OR: [
              { agentUser: { username: { contains: search} } },
              { agentUser: { first_name: { contains: search } } },
              { agentUser: { last_name: { contains: search } } },
            ],
          }
        : {}),
    },
    include: {
      agentUser: {
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          profile_img: true,
          status: true,
        },
      },
      permission: true,
    },
    orderBy,
    take: limit,
    skip: offset,
  });
}
async getAgentsCountByAgency(
  agencyId: number,
  showAllStatuses = false,
  search?: string,
  agentStatus?: agencyagent_status
) {
  return this.prisma.agencyagent.count({
    where: {
      agency_id: agencyId,
      ...(showAllStatuses ? {} : { status: 'active' }),
      ...(agentStatus ? { status: agentStatus } : {}),
      ...(search
        ? {
            OR: [
              { agentUser: { is: { username: { contains: search } } } },
              { agentUser: { is: { first_name: { contains: search } } } },
              { agentUser: { is: { last_name: { contains: search} } } },
            ],
          }
        : {}),
    },
  });
}
// async getAgentsByAgency(
//   agencyId: number,
//   agentStatus?: agencyagent_status,
//   limit?: number,
//   offset?: number,
//   showAllStatuses: boolean = false, 
// ) {
//   return this.prisma.agencyagent.findMany({
//     where: {
//       agency_id: agencyId,
//       ...(showAllStatuses
//         ? {} 
//         : { status: 'active' }),
//     },
//     include: {
//       agentUser: {
//         select: {
//           id: true,
//           username: true,
//           email: true,
//           first_name: true,
//           last_name: true,
//           profile_img: true,
//           status: true,
//         },
//       },
//       permission: true,
//     },
//     orderBy: { created_at: 'desc' },
//     take: limit,
//     skip: offset,
//   });
// }

// async getAgentsCountByAgency(
//   agencyId: number,
//   showAllStatuses: boolean = false,
// ) {
//   return this.prisma.agencyagent.count({
//     where: {
//       agency_id: agencyId,
//       ...(showAllStatuses ? {} : { status: 'active' }),
//     },
//   });
// }
//  async getAgentsCountByAgency(
//   agencyId: number,
//   agentStatus?: agencyagent_status,
// ){
//   return this.prisma.agencyagent.count({
//     where: {
//       agency_id: agencyId,
//       ...(agentStatus ? { status: agentStatus } : {}),
//       agentUser: {
//         status: 'active',
//       },
//     },
//   });
// }
}



  // async findByIdCardNumber(idCardNumber: string) {
  //   return await this.prisma.agencyagent.findUnique({
  //     where: { id_card_number: idCardNumber },
  //   });
  // }

