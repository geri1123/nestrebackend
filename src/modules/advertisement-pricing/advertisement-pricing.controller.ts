
import { Body, Controller, Get, Param , Post} from "@nestjs/common";

import { GetAllPricingUseCase } from "./application/use-cases/get-all-pricing.use-case";
import { GetPricingUseCase } from "./application/use-cases/get-pricing.use-case";
import { UpdatePricingUseCase } from "./application/use-cases/update-pricing.use-case";
import { CreatePricingUseCase } from "./application/use-cases/create-pricing.use-case";
import { Public } from "../../common/decorators/public.decorator";
import { AdvertisementPricingSwagger } from "./response/advertisement-pricing.swagger.response";
import { CreatePricingDto } from "./dto/create-pricing.dto";
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

 @Post()
  async create(@Body() dto: CreatePricingDto) {
    return this.createPricing.execute(dto);
  }

@AdvertisementPricingSwagger.GetPricingByType()

  @Get(":type")
  async getByType(@Param("type") type: string) {
    return this.getPricing.execute(type);
  }


}
