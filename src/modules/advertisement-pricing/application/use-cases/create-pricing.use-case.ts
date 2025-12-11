import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { ADVERTISEMENT_PRICING_REPO } from "../../domain/repositories/advertisement-pricing.repository.interface";
import {type IAdvertisementPricingRepository } from "../../domain/repositories/advertisement-pricing.repository.interface";
import { CreatePricingDto } from "../../dto/create-pricing.dto";
@Injectable()
export class CreatePricingUseCase {
  constructor(
    @Inject(ADVERTISEMENT_PRICING_REPO)
    private readonly repo: IAdvertisementPricingRepository
  ) {}

  async execute(dto: CreatePricingDto) {
    const existing = await this.repo.getPricing(dto.adType);
    if (existing) throw new BadRequestException("Pricing already exists for this type.");

    return this.repo.create(dto);
  }
}