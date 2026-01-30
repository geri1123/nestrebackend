
import { Controller, Get, Param} from "@nestjs/common";

import { GetAllPricingUseCase } from "./application/use-cases/get-all-pricing.use-case";
import { GetPricingUseCase } from "./application/use-cases/get-pricing.use-case";
import { UpdatePricingUseCase } from "./application/use-cases/update-pricing.use-case";
import { CreatePricingUseCase } from "./application/use-cases/create-pricing.use-case";
import { Public } from "../../common/decorators/public.decorator";
import { AdvertisementPricingSwagger } from "./response/advertisement-pricing.swagger.response";
@Public()
@Controller("advertisement-pricing")
export class AdvertisementPricingController {
  constructor(
    private readonly getAllPricing: GetAllPricingUseCase,
    private readonly getPricing: GetPricingUseCase,
    private readonly updatePricing: UpdatePricingUseCase,
    private readonly createPricing: CreatePricingUseCase
  ) {}
@AdvertisementPricingSwagger.GetAllPricing()
  @Get()
  async getAll() {
    return this.getAllPricing.execute();
  }
@AdvertisementPricingSwagger.GetPricingByType()

  @Get(":type")
  async getByType(@Param("type") type: string) {
    return this.getPricing.execute(type);
  }


}
