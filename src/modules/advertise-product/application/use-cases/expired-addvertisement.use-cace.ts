import { Inject, Injectable } from "@nestjs/common";
import {type IProductAdvertisementRepository } from "../../domain/repositories/Iporiduct-advertisement.repository";

@Injectable()
export class ExpireProductAdsUseCase {
  constructor(@Inject("IProductAdvertisementRepository")
    private readonly adRepo: IProductAdvertisementRepository) {}

  async execute(): Promise<number> {
    const now = new Date();
    return this.adRepo.expireAds(now);
  }
}