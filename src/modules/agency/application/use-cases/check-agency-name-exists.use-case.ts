import { Injectable, Inject } from '@nestjs/common';
import {AGENCY_REPO, type IAgencyDomainRepository } from '../../domain/repositories/agency.repository.interface';

@Injectable()
export class CheckAgencyNameExistsUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(agencyName: string): Promise<boolean> {
    return this.agencyRepo.agencyNameExists(agencyName);
  }
}