import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductAdvertisementCleanupService } from '../modules/advertise_product/product-advertisement-cleanup.service';

@Injectable()
export class UpdateExpiredAdvertisementCron {
  private readonly logger = new Logger(UpdateExpiredAdvertisementCron.name);

  constructor(private readonly cleanUpService: ProductAdvertisementCleanupService) {}

  
//   @Cron('0 * * * *') //every hour
  
 @Cron('0 */10 * * * *')
  async handleCron() {
    const expiredCount = await this.cleanUpService.expireAds();
    this.logger.log(`Expired ${expiredCount} product advertisements.`);
  }
}