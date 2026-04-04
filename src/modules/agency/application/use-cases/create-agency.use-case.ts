import { Inject, Injectable } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AgencyStatus, Prisma } from '@prisma/client';
import { SupportedLang, t } from '../../../../locales';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';

export interface CreateAgencyData {
  agencyName: string;
  licenseNumber: string;
  address: string;
}

@Injectable()
export class CreateAgencyUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
  
  ) {}

  async execute(
    data: CreateAgencyData,
    ownerUserId: number,
    status: AgencyStatus,
    lang: SupportedLang = 'al',
    tx?: Prisma.TransactionClient 
  ): Promise<number> {

    const errors: Record<string, string[]> = {};

    // DOMAIN VALIDATION
    if (await this.agencyRepository.agencyNameExists(data.agencyName)) {
      errors.agency_name = [t('agencyExists', lang)];
    }

    if (await this.agencyRepository.licenseExists(data.licenseNumber)) {
      errors.license_number = [t('licenseExists', lang)];
    }

    if (Object.keys(errors).length > 0) {
      throwValidationErrors([], lang, errors);
    }

    // CREATE AGENCY
    return await this.agencyRepository.create({
      agencyName: data.agencyName,
      licenseNumber: data.licenseNumber,
      address: data.address,
      ownerUserId: ownerUserId,
      status,
     
    },
  
   tx);
  }
}