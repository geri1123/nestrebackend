import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { CleanupService } from '../modules/cleanup/service/clean-up.service';
@Injectable()
export class DeleteInactiveUsersCron {
  private readonly logger = new Logger(DeleteInactiveUsersCron.name);

  constructor(private readonly cleanUpService:CleanupService) {}

  
// @Cron('*/10 * * * * *')
@Cron('*/5 * * * *')
async handleUserCleanup() {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const deletedCount = await this.cleanUpService.deleteInactiveUnverifiedUsersBefore(twoWeeksAgo);
    this.logger.log(`Deleted ${deletedCount} inactive unverified users.`);
  } catch (error: any) {
    this.logger.error('Failed to delete inactive unverified users:', error);
  }
}
}