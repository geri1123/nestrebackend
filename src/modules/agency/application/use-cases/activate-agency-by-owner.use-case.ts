import { Inject, Injectable, BadRequestException } from '@nestjs/common';

import { SupportedLang, t } from '../../../../locales';
import { AGENCY_REPOSITORY_TOKENS } from '../../../agency/domain/repositories/agency.repository.tokens';
import {type IAgencyDomainRepository } from '../../../agency/domain/repositories/agency.repository.interface';

@Injectable()
export class ActivateAgencyByOwnerUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly repo: IAgencyDomainRepository,
  ) {}

  async execute(ownerUserId: number, lang: SupportedLang): Promise<void> {
    const agency = await this.repo.findByOwnerUserId(ownerUserId);

    if (!agency) {
      throw new BadRequestException(t('agencyNotFound', lang));
    }

    await this.repo.activateAgency(agency.id);
  }
}