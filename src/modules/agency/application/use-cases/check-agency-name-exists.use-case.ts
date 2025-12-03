import { Injectable, Inject } from '@nestjs/common';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';

@Injectable()
export class CheckAgencyNameExistsUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(agencyName: string): Promise<boolean> {
    return this.agencyRepo.agencyNameExists(agencyName);
  }
}