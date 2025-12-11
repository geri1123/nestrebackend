import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { AdvertisementPricingEntity } from "../../domain/entities/advertisement-pricing.entity";

import {ADVERTISEMENT_PRICING_REPO, type IAdvertisementPricingRepository } from "../../domain/repositories/advertisement-pricing.repository.interface";

@Injectable()
export class GetPricingUseCase {
  constructor(
    @Inject(ADVERTISEMENT_PRICING_REPO)
    private repo: IAdvertisementPricingRepository
  ) {}

  async execute(adType: string): Promise<AdvertisementPricingEntity> {
    const pricing = await this.repo.getPricing(adType as any);
    if (!pricing) throw new NotFoundException("Pricing not found");
    return pricing;
  }
}