import { Injectable } from "@nestjs/common";
import { ExpireProductAdsUseCase } from "../use-cases/expired-addvertisement.use-cace";
@Injectable()
export class ProductAdvertisementCleanupService {
  constructor(private readonly expireAdsUseCase: ExpireProductAdsUseCase) {}

  async expireAds(): Promise<number> {
    return this.expireAdsUseCase.execute();
  }
}