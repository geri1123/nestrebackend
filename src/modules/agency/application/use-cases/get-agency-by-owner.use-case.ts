import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { t, SupportedLang } from '../../../../locales';

@Injectable()
export class GetAgencyByOwnerUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(ownerUserId: number, lang: SupportedLang) {
    const agency = await this.agencyRepo.findByOwnerUserId(ownerUserId);

    if (!agency) {
      throw new UnauthorizedException(t('userNotAssociatedWithAgency', lang));
    }

    return agency;
  }
}