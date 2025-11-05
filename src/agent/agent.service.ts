import {  BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AgentsRepository } from "../repositories/agent/agent.repository";
import { SupportedLang, t } from "../locales";
import { Createagentdata } from "./types/create-agent";
import { error } from "console";


@Injectable()

export class AgentService{
    constructor(private readonly agentrepo:AgentsRepository){}
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
}