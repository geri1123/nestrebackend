import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExpireProductAdsUseCase } from '../modules/advertise-product/application/use-cases/expired-addvertisement.use-cace';
import { CleanupService } from '../modules/cleanup/service/clean-up.service';
@Injectable()
export class UpdateExpiredAdvertisementCron {
  private readonly logger = new Logger(UpdateExpiredAdvertisementCron.name);

  constructor(private readonly cleanupService: CleanupService) {}

  
//   @Cron('0 * * * *') //every hour
  
 @Cron('0 */10 * * * *')
async handleAdCleanup() {
  try {
    const expiredCount = await this.cleanupService.expireExpiredAdvertisements();
    this.logger.log(`Expired ${expiredCount} product advertisements.`);
  } catch (error: any) {
    this.logger.error('Failed to expire product advertisements:', error);
  }
}
}