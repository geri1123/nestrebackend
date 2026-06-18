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

  const expiredAds = await this.adRepo.expireAndReturnAds(now);
  if (expiredAds.length === 0) return 0;

  const batchSize = 20;
  for (let i = 0; i < expiredAds.length; i += batchSize) {
    const batch = expiredAds.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(ad =>
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
  }

  return expiredAds.length;
}
}