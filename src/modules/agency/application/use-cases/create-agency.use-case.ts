import { Inject, Injectable } from '@nestjs/common';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import { agency_status } from '@prisma/client';
import { SupportedLang, t } from '../../../../locales';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';

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
    language: SupportedLang = 'al',
  ): Promise<number> {
    // Check if agency name or license already exists
    const errors: Record<string, string[]> = {};

    if (await this.agencyRepository.agencyNameExists(data.agency_name)) {
      errors.agency_name = [t('agencyExists', language)];
    }

    if (await this.agencyRepository.licenseExists(data.license_number)) {
      errors.license_number = [t('licenseExists', language)];
    }

    if (Object.keys(errors).length > 0) {
      throwValidationErrors([], language, errors);
    }

    // Create agency
    const agencyId = await this.agencyRepository.create({
      agency_name: data.agency_name,
      license_number: data.license_number,
      address: data.address,
      owner_user_id: ownerUserId,
      status,
    });

    return agencyId;
  }
}