import { Inject, Injectable } from '@nestjs/common';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import { agency_status } from '@prisma/client';
import { SupportedLang, t } from '../../../../locales';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';
import { CheckAgencyNameExistsUseCase } from './check-agency-name-exists.use-case';

export interface CreateAgencyData {
  agency_name: string;
  license_number: string;
  address: string;
}

@Injectable()
export class CreateAgencyUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepository: IAgencyDomainRepository,
  
  ) {}

  async execute(
    data: CreateAgencyData,
    ownerUserId: number,
    status: agency_status,
    lang: SupportedLang = 'al',
  ): Promise<number> {

    const errors: Record<string, string[]> = {};

    // DOMAIN VALIDATION
    if (await this.agencyRepository.agencyNameExists(data.agency_name)) {
      errors.agency_name = [t('agencyExists', lang)];
    }

    if (await this.agencyRepository.licenseExists(data.license_number)) {
      errors.license_number = [t('licenseExists', lang)];
    }

    if (Object.keys(errors).length > 0) {
      throwValidationErrors([], lang, errors);
    }

    // CREATE AGENCY
    return await this.agencyRepository.create({
      agency_name: data.agency_name,
      license_number: data.license_number,
      address: data.address,
      owner_user_id: ownerUserId,
      status,
    });
  }
}