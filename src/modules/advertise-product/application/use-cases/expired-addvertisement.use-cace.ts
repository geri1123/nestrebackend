import { Inject, Injectable } from "@nestjs/common";
import {ADVERTISE_REPO, type IProductAdvertisementRepository } from "../../domain/repositories/Iporiduct-advertisement.repository";

@Injectable()
export class ExpireProductAdsUseCase {
  constructor(
   @Inject(ADVERTISE_REPO)
    private readonly adRepo: IProductAdvertisementRepository) {}

  async execute(): Promise<number> {
    const now = new Date();
    return this.adRepo.expireAds(now);
  }
}