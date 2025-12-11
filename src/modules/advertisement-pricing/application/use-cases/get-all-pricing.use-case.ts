import { Inject, Injectable } from "@nestjs/common";
import { ADVERTISEMENT_PRICING_REPO,type IAdvertisementPricingRepository } from "../../domain/repositories/advertisement-pricing.repository.interface";

@Injectable()
export class GetAllPricingUseCase {
  constructor(
    @Inject(ADVERTISEMENT_PRICING_REPO)
    private repo: IAdvertisementPricingRepository
  ) {}

  async execute() {
    return this.repo.getAll();
  }
}