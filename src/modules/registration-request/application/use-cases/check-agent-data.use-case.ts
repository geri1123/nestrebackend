import { Inject, Injectable } from "@nestjs/common";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import { GetAgencyByPublicCodeUseCase } from "../../../agency/application/use-cases/check-public-code.use-case";
import { EnsureIdCardUniqueUseCase } from "../../../agent/application/use-cases/ensure-idcard-unique.use-case";
import { SupportedLang, t } from "../../../../locales";

@Injectable()
export class CheckAgentDataUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) private readonly repo: IRegistrationRequestRepository,
    private readonly getAgencyByPublicCode: GetAgencyByPublicCodeUseCase,
    private readonly ensureIdCardUnique: EnsureIdCardUniqueUseCase,
  ) {}

  async execute(publicCode: string, idCard: string, lang: SupportedLang) {
    const errors: Record<string, string[]> = {};

    try {
      await this.getAgencyByPublicCode.execute(publicCode, lang);
    } catch {
      errors.public_code = [t("invalidPublicCode", lang)];
    }

    

    await this.ensureIdCardUnique.execute(idCard, lang);

    return errors;
  }
}