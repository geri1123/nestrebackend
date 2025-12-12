import { Injectable, Inject } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';

@Injectable()
export class CheckLicenseExistsUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(licenseNumber: string): Promise<boolean> {
    return this.agencyRepo.licenseExists(licenseNumber);
  }
}