import { Inject, Injectable } from "@nestjs/common";
import {AGENCY_REPO, type IAgencyDomainRepository } from "../../domain/repositories/agency.repository.interface";

@Injectable()
export class DeleteAgencyByOwnerUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(ownerUserId: number): Promise<void> {
    await this.agencyRepo.deleteByOwnerUserId(ownerUserId);
  }
}
