import { Inject, Injectable } from "@nestjs/common";
import { AGENCY_REPOSITORY_TOKENS } from "../../domain/repositories/agency.repository.tokens";
import {type IAgencyDomainRepository } from "../../domain/repositories/agency.repository.interface";
import { CreateAgencyData } from "./create-agency.use-case";
import { SupportedLang, t } from "../../../../locales";
import { throwValidationErrors } from "../../../../common/helpers/validation.helper";

@Injectable()
export class ValidateAgencyBeforeRegisterUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepository: IAgencyDomainRepository
  ) {}

  async execute(data: CreateAgencyData, lang: SupportedLang) {
    const errors: Record<string, string[]> = {};

    if (await this.agencyRepository.agencyNameExists(data.agency_name)) {
      errors.agency_name = [t('agencyExists', lang)];
    }

    if (await this.agencyRepository.licenseExists(data.license_number)) {
      errors.license_number = [t('licenseExists', lang)];
    }

    if (Object.keys(errors).length > 0) {
      throwValidationErrors([], lang, errors);
    }
  }
}