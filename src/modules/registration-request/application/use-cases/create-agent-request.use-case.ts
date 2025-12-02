import { Inject, Injectable } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { GetAgencyByPublicCodeUseCase } from "../../../agency/application/use-cases/check-public-code.use-case";
import { EnsureIdCardUniqueUseCase } from "../../../agent/application/use-cases/ensure-idcard-unique.use-case";
import { RegisterAgentDto } from "../../../auth/dto/register-agent.dto";
import { SupportedLang } from "../../../../locales";
import { RegistrationRequestEntity } from "../../domain/entities/registration-request.entity";

@Injectable()
export class CreateAgentRequestUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) private readonly repo: IRegistrationRequestRepository,
    private readonly getAgencyByPublicCode: GetAgencyByPublicCodeUseCase,
    private readonly ensureIdCardUnique: EnsureIdCardUniqueUseCase,
  ) {}

  async execute(userId: number, dto: RegisterAgentDto, lang: SupportedLang) {
    const agency = await this.getAgencyByPublicCode.execute(dto.public_code, lang);

    await this.ensureIdCardUnique.execute(dto.id_card_number, lang);

    const entity = RegistrationRequestEntity.createNew({
      userId,
      idCardNumber: dto.id_card_number,
      agencyId: agency.id,
      agencyName: agency.agencyName,
      requestedRole: dto.requested_role,
      requestType: "agent_license_verification",
    });

    await this.repo.create(entity);
  }
}