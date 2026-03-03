import { Inject, Injectable } from "@nestjs/common";
import { ADVERTISEMENT_PRICING_REPO,type IAdvertisementPricingRepository } from "../../domain/repositories/advertisement-pricing.repository.interface";

@Injectable()
export class GetAllPricingUseCase {
  constructor(
    @Inject(ADVERTISEMENT_PRICING_REPO)
    private repo: IAdvertisementPricingRepository
  ) {}

 async execute() {
  const pricings = await this.repo.getAll();
  
  return pricings.map((p) => ({
    ...p,
   finalPrice: p.discount ? Math.round((p.price - (p.price * p.discount) / 100) * 100) / 100 : p.price,
  }));
}
}