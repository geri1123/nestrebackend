import { Injectable } from "@nestjs/common";
import { AdvertiseProductUseCase } from "../use-cases/advertise-product.use-case";
import { SupportedLang } from "../../../../locales";
import { advertisement_type } from "@prisma/client";

@Injectable()
export class ProductAdvertisementService {
  constructor(private readonly advertiseUseCase: AdvertiseProductUseCase) {}

  async advertise(productId: number, adType: advertisement_type, userId: number, language: SupportedLang) {
    return this.advertiseUseCase.execute(productId, adType, userId, language);
  }
}