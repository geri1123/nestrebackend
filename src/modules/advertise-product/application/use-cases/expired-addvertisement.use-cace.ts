import { Inject, Injectable } from "@nestjs/common";
import { ADVERTISE_REPO, type IProductAdvertisementRepository } from "../../domain/repositories/Iporiduct-advertisement.repository";
import { NotificationService } from "../../../notification/notification.service";

@Injectable()
export class ExpireProductAdsUseCase {
  constructor(
    @Inject(ADVERTISE_REPO)
    private readonly adRepo: IProductAdvertisementRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(): Promise<number> {
    const now = new Date();
    
    // 1. Find expired ads BEFORE updating
    const expiredAds = await this.adRepo.findExpiredAds(now);
    
    // 2. Expire them
    const count = await this.adRepo.expireAds(now);
    
    // 3. Send notifications
    await Promise.all(
      expiredAds.map(ad =>
        this.notificationService.sendNotification({
          userId: ad.userId,
          type: 'advertisement_expire',
          templateData: { productId: ad.productId },
          metadata: { 
            productId: ad.productId,
            advertisementId: ad.id,
          },
        })
      )
    );
    
    return count;
  }
}