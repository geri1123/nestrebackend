import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { RegisterAgentDto } from "../../../registration/dto/register-agent.dto";
import { SupportedLang, t } from "../../../../locales";
import { RegistrationRequestEntity } from "../../domain/entities/registration-request.entity";
import { Prisma } from "@prisma/client";

@Injectable()
export class CreateAgentRequestUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) 
    private readonly repo: IRegistrationRequestRepository,
  ) {}

  async execute(
    userId: number, 
    dto: RegisterAgentDto, 
    agency: { id: number; agencyName: string }, 
    lang: SupportedLang,
    tx?:Prisma.TransactionClient

  ) {
    

    const entity = RegistrationRequestEntity.createNew({
      userId,
     
      agencyId: agency.id,
      requestedRole: dto.requested_role,
      requestType: "agent_license_verification",

    });

    await this.repo.create(entity , tx);
  }
}


