import { Inject, Injectable } from "@nestjs/common";
import { AGENCY_REPOSITORY_TOKENS } from "../../domain/repositories/agency.repository.tokens";
import {type IAgencyDomainRepository } from "../../domain/repositories/agency.repository.interface";

@Injectable()
export class DeleteAgencyByOwnerUseCase {
  constructor(
    @Inject(AGENCY_REPOSITORY_TOKENS.AGENCY_REPOSITORY)
    private readonly agencyRepo: IAgencyDomainRepository,
  ) {}

  async execute(ownerUserId: number): Promise<void> {
    await this.agencyRepo.deleteByOwnerUserId(ownerUserId);
  }
}
