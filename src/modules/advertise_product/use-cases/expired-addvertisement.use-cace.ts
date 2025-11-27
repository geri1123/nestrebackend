import { Inject, Injectable } from "@nestjs/common";
import { ProductAdvertisementRepository } from "../../../repositories/product_advertisement/product_advertisement.repository";
import {type IProductAdvertisementRepository } from "../../../repositories/product_advertisement/Iporiduct_advertisement.repository";
@Injectable()
export class ExpireProductAdsUseCase {
  constructor(@Inject("IProductAdvertisementRepository")
    private readonly adRepo: IProductAdvertisementRepository) {}

  async execute(): Promise<number> {
    const now = new Date();
    return this.adRepo.expireAds(now);
  }
}