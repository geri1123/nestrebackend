import {  BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AgentsRepository } from "../../repositories/agent/agent.repository";
import { SupportedLang, t } from "../../locales";
import { Createagentdata } from "./types/create-agent";
import { error } from "console";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
import { type AgentPaginationResponseDto } from "./dto/agentsinagency.dto";


@Injectable()

export class AgentService{
    constructor(
      private readonly agentrepo:AgentsRepository,
      private readonly firebaseService:FirebaseService
    ){}
    async ensureIdCardIsUnique(id_card_number: string, language: SupportedLang): Promise<void> {
    const existingAgent = await this.agentrepo.findByIdCardNumber(id_card_number);
    if (existingAgent) {
      throw new BadRequestException({
        id_card_number: [t("idCardExists", language)],
      });
    }
  }
 
  async createAgencyAgent(data: Createagentdata  ,language: SupportedLang="al"){
    return this.agentrepo.createAgencyAgent(data);
  }
  async findByAgencyAndAgent(agencyId: number, agentId: number, language: SupportedLang = "al") {
  const agent = await this.agentrepo.findByAgencyAndAgent(agencyId, agentId); 
  if (!agent) {
    throw new NotFoundException({
      success: false,
      message: t("userNotFound", language),
      errors: { general: t("userNotFound", language) },
    });
  }
  return agent;
}
 async findExistingAgent(agentId: number, language: SupportedLang) {
  const existingAgent = await this.agentrepo.findExistingAgent(agentId);

  if (existingAgent) {
    throw new BadRequestException({
      success: false,
      message: t('validationFailed', language),
      errors: {
        general: [t('agentExist', language)],
      },
    });
  }

  return existingAgent; 
}


  async getAgencyIdForAgent(agentId: number): Promise<number | null> {
    return await this.agentrepo.findAgencyIdByAgent(agentId);
  }

  async getAgentWithPermissions(agencyAgentId: number) {
  return this.agentrepo.getAgentWithPermissions(agencyAgentId);
}

async getAgentsForPublicView(
  agencyId: number,
  page: number = 1,
  limit: number = 10,
  language: SupportedLang
):Promise<AgentPaginationResponseDto> {
  try {
    const offset = (page - 1) * limit;

    const [agentsPage, totalCount] = await Promise.all([
         this.agentrepo.getAgentsByAgency(agencyId, 'active', limit, offset, false),
    this.agentrepo.getAgentsCountByAgency(agencyId, false),
    ]);

    if (!agentsPage || agentsPage.length === 0) {
      return { agents: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    const agentsForFrontend = agentsPage.map(agent => ({
      id: agent.id,
    
     
     
      role_in_agency: agent.role_in_agency,
      
     
      status: agent.status,
      created_at: agent.created_at,
      
      agentUser: agent.agentUser
        ? {
            id: agent.agentUser.id,
            username: agent.agentUser.username,
            email: agent.agentUser.email,
            
            first_name: agent.agentUser.first_name ?? null,
            last_name: agent.agentUser.last_name ?? null,
            profile_image:agent.agentUser.profile_img? 
            this.firebaseService.getPublicUrl(agent.agentUser.profile_img) : null,
           
          }
        : null,
      
    }));

    return {
      agents: agentsForFrontend,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    throw new InternalServerErrorException(t('somethingWentWrong', language));
  }
}


//getagents for logedin agents | agency owner
async getAgentsForProtectedRoute(
  agencyId: number,
  page: number = 1,
  limit: number = 10,
  language: SupportedLang,
  search?: string,
  sortBy: 'asc' | 'desc' = 'desc'
): Promise<AgentPaginationResponseDto> {
  const offset = (page - 1) * limit;

  const [agentsPage, totalCount] = await Promise.all([
    this.agentrepo.getAgentsByAgency(agencyId, undefined, limit, offset, true, search, sortBy),
    this.agentrepo.getAgentsCountByAgency(agencyId, true, search),
  ]);

  if (!agentsPage || agentsPage.length === 0) {
    return { agents: [], totalCount: 0, totalPages: 0, currentPage: page };
  }

  const agentsForFrontend = agentsPage.map(agent => ({
    id: agent.id,
    role_in_agency: agent.role_in_agency,
    status: agent.status,
    created_at: agent.created_at,
    agentUser: agent.agentUser
      ? {
          id: agent.agentUser.id,
          username: agent.agentUser.username,
          email: agent.agentUser.email,
          first_name: agent.agentUser.first_name ?? null,
          last_name: agent.agentUser.last_name ?? null,
          profile_image: agent.agentUser.profile_img
            ? this.firebaseService.getPublicUrl(agent.agentUser.profile_img)
            : null,
        }
      : null,
  }));

  return {
    agents: agentsForFrontend,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}
}