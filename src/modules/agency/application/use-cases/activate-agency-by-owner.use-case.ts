import { Inject, Injectable, BadRequestException } from '@nestjs/common';

import { SupportedLang, t } from '../../../../locales';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActivateAgencyByOwnerUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly repo: IAgencyDomainRepository,
  ) {}

  async execute(
    ownerUserId: number, 
    lang: SupportedLang, 
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    
    const agency = await this.repo.findByOwnerUserId(ownerUserId);

    if (!agency) {
      throw new BadRequestException(t('agencyNotFound', lang));
    }

    await this.repo.activateAgency(agency.id, tx);
  }
}