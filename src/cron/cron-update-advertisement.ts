import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExpireProductAdsUseCase } from '../modules/advertise-product/application/use-cases/expired-addvertisement.use-cace';
@Injectable()
export class UpdateExpiredAdvertisementCron {
  private readonly logger = new Logger(UpdateExpiredAdvertisementCron.name);

  constructor(private readonly cleanupUsecase: ExpireProductAdsUseCase) {}

  
//   @Cron('0 * * * *') //every hour
  
 @Cron('0 */10 * * * *')
  async handleCron() {
    const expiredCount = await this.cleanupUsecase.execute();
    this.logger.log(`Expired ${expiredCount} product advertisements.`);
  }
}