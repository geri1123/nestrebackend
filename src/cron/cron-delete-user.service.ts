import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { UserCleanupService } from '../modules/cleanup/service/user-clean-up.service';

@Injectable()
export class DeleteInactiveUsersCron {
  private readonly logger = new Logger(DeleteInactiveUsersCron.name);

  constructor(private readonly cleanUpService:UserCleanupService) {}

  
// @Cron('*/10 * * * *')
@Cron('*/5 * * * *')
async handleCron() {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const deletedCount = await this.cleanUpService.deleteInactiveUnverifiedUsersBefore(twoWeeksAgo);
    this.logger.log(`Deleted ${deletedCount} inactive unverified users.`);
  } catch (error) {
    this.logger.error('DeleteInactiveUsersCron failed:', error.message);
  }
}
}