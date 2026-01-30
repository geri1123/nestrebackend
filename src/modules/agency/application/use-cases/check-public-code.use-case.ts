import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { SupportedLang, t } from '../../../../locales';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { Agency } from '../../domain/entities/agency.entity';

@Injectable()
export class GetAgencyByPublicCodeUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepository: IAgencyDomainRepository,
  ) {}

  async execute(publicCode: string, language: SupportedLang = 'al'): Promise<Agency> {
    const agency = await this.agencyRepository.findByPublicCode(publicCode);

    if (!agency) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors:{
          public_code: [t('agencyNotFound', language)],
        }
      });
    }

    return agency;
  }
}