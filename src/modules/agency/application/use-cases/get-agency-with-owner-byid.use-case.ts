import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {AGENCY_REPO, type IAgencyDomainRepository } from "../../domain/repositories/agency.repository.interface";
import { SupportedLang, t } from "../../../../locales";

@Injectable()
export class GetAgencyWithOwnerByIdUseCase {
  constructor(
    @Inject(AGENCY_REPO)
    private readonly repo: IAgencyDomainRepository
  ) {}

  async execute(id: number, lang: SupportedLang) {
    const agency = await this.repo.getAgencyWithOwnerById(id);

    if (!agency) {
      throw new BadRequestException(t("agencyNotFound", lang));

    }

    return agency;
  }
}