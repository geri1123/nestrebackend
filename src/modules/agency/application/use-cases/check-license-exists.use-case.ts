import { Injectable, Inject } from '@nestjs/common';
import { AGENCY_REPOSITORY_TOKENS } from '../../domain/repositories/agency.repository.tokens';
import {type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';

@Injectable()
export class CheckLicenseExistsUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(licenseNumber: string): Promise<boolean> {
    return this.agencyRepo.licenseExists(licenseNumber);
  }
}