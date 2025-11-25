import { Injectable } from "@nestjs/common";
import { ProductAdvertisementRepository } from "../../repositories/product_advertisement/product_advertisement.repository";

@Injectable()
export class ProductAdvertisementCleanupService {
  constructor(private readonly adRepo: ProductAdvertisementRepository) {}

  async expireAds(): Promise<number> {
    const now = new Date(); 
    return this.adRepo.expireAds(now);
  }
}