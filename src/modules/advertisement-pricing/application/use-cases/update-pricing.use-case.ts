import { Inject, Injectable } from "@nestjs/common";
import { advertisement_type } from "@prisma/client";
import { ADVERTISEMENT_PRICING_REPO,type IAdvertisementPricingRepository } from "../../domain/repositories/advertisement-pricing.repository.interface";

@Injectable()
export class UpdatePricingUseCase {
  constructor(
    @Inject(ADVERTISEMENT_PRICING_REPO)
    private repo: IAdvertisementPricingRepository
  ) {}

  async execute(
    adType: advertisement_type,
    data: { price?: number; duration?: number; discount?: number; isActive?: boolean }
  ) {
    return this.repo.update(adType, data);
  }
}