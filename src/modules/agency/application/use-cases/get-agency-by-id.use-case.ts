import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import { Agency } from '../../domain/entities/agency.entity';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class GetAgencyByIdUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepository: IAgencyDomainRepository,
  ) {}

  async execute(agencyId: number, language: SupportedLang = 'al'): Promise<Agency> {
    const agency = await this.agencyRepository.findById(agencyId);

    if (!agency) {
      throw new BadRequestException({
        success: false,
        message: t('agencyNotFound', language),
      });
    }

    return agency;
  }
}