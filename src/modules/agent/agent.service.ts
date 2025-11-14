import {  BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AgentsRepository } from "../../repositories/agent/agent.repository";
import { SupportedLang, t } from "../../locales";
import { Createagentdata } from "./types/create-agent";
import { error } from "console";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
import { type AgentPaginationResponseDto } from "./dto/agentsinagency.dto";
import { agencyagent, agencyagent_status } from "@prisma/client";
import { FilterAgentsDto, sort } from "./dto/filter-agents.dto";
import { formatDate } from "../../common/utils/date";


@Injectable()

export class AgentService{
    constructor(
      private readonly agentrepo:AgentsRepository,
      private readonly firebaseService:FirebaseService
    ){}


   async findById(agentId: number): Promise<agencyagent | null> {
  return await this.agentrepo.findById(agentId);
}
    async ensureIdCardIsUnique(id_card_number: string, language: SupportedLang): Promise<void> {
    const existingAgent = await this.agentrepo.findByIdCardNumber(id_card_number);
    if (existingAgent) {
      throw new BadRequestException({
        id_card_number: [t("idCardExists", language)],
      });
    }
  }
 //-----
 //crete agent
 //-----
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

//======
//find if agent exist
//========
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
//-------

//get protected and public agents

//-------
async getAgents(
  agencyId: number,
  page = 1,
  limit = 12,
  language: SupportedLang,
  filters: FilterAgentsDto,
  showAllStatuses = false, 
  defaultStatus?: agencyagent_status, 
): Promise<AgentPaginationResponseDto> {
  try {
    const offset = (page - 1) * limit;
    const { search, sort = "created_at_desc", status } = filters;

    const finalStatus = defaultStatus ?? status;


    const [agentsPage, totalCount] = await Promise.all([
      this.agentrepo.getAgentsByAgency(
        agencyId,
        finalStatus,
        limit,
        offset,
        showAllStatuses,
        search,
        sort as sort,
      ),
      this.agentrepo.getAgentsCountByAgency(
        agencyId,
        showAllStatuses,
        search,
        finalStatus,
      ),
    ]);

    if (!agentsPage || agentsPage.length === 0) {
      return { agents: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    
    const agentsForFrontend = agentsPage.map(agent => ({
      id: agent.id,
      role_in_agency: agent.role_in_agency,
      status: agent.status,
   created_at: formatDate(agent.created_at),
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
  } catch (error) {
    throw new InternalServerErrorException(t("somethingWentWrong", language));
  }
}
}