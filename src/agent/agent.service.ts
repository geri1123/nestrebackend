import {  BadRequestException, Injectable } from "@nestjs/common";
import { AgentsRepository } from "../repositories/agent/agent.repository";
import { SupportedLang, t } from "../locales";
import { Createagentdata } from "./types/create-agent";

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
}