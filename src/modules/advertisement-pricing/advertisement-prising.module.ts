import { Module } from "@nestjs/common";




import { AdvertisementPricingRepository } from "./infrastructure/persistence/advertisement-pricing.repository";
import { ADVERTISEMENT_PRICING_REPO } from "./domain/repositories/advertisement-pricing.repository.interface";
import { UpdatePricingUseCase } from "./application/use-cases/update-pricing.use-case";
import { GetAllPricingUseCase } from "./application/use-cases/get-all-pricing.use-case";
import { GetPricingUseCase } from "./application/use-cases/get-pricing.use-case";
import { AdvertisementPricingController } from "./advertisement-pricing.controller";
import { CreatePricingUseCase } from "./application/use-cases/create-pricing.use-case";

@Module({
  controllers: [AdvertisementPricingController],
  providers: [
  //use-casses
    UpdatePricingUseCase,
    GetAllPricingUseCase,
    GetPricingUseCase,
    CreatePricingUseCase,
  //repo
    {
      provide: ADVERTISEMENT_PRICING_REPO,
      useClass: AdvertisementPricingRepository
    }
  ],
  exports: [
    GetAllPricingUseCase,
    GetPricingUseCase,
    
  ]
})
export class AdvertisementPricingModule {}