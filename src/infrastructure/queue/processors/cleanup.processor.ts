import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CleanupService } from '../../../modules/cleanup/service/clean-up.service';
import { CLEANUP_JOBS, QUEUES } from '../constants/queue-names.constant';

@Processor(QUEUES.CLEANUP, {
  concurrency: 1,
})
export class CleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(CleanupProcessor.name);

  constructor(private readonly cleanupService: CleanupService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing cleanup job: ${job.name} (ID: ${job.id})`);

    try {
      switch (job.name) {
        case CLEANUP_JOBS.DELETE_INACTIVE_USERS:
          return await this.deleteInactiveUsers(job);
        case CLEANUP_JOBS.EXPIRE_ADS:
          return await this.expireAds(job);
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
          return { success: false, message: 'Unknown job type' };
      }
    } catch (error: any) {
      this.logger.error(`Error processing job ${job.name}:`, error.message);
      throw error;
    }
  }

  private async deleteInactiveUsers(job: Job) {
    const startTime = Date.now();
    this.logger.log('Starting inactive users cleanup...');

    try {
      // Calculate 14 days ago
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const deletedCount =
        await this.cleanupService.deleteInactiveUnverifiedUsersBefore(
          twoWeeksAgo,
        );

      const duration = Date.now() - startTime;
      this.logger.log(
        `✓ Deleted ${deletedCount} inactive users in ${duration}ms`,
      );

      return {
        success: true,
        deletedCount,
        cutoffDate: twoWeeksAgo.toISOString(),
        duration,
      };
    } catch (error: any) {
      this.logger.error('Failed to delete inactive users:', error.message);
      throw error;
    }
  }

  private async expireAds(job: Job) {
    const startTime = Date.now();
    this.logger.log('Starting advertisements expiration...');

    try {
      const expiredCount =
        await this.cleanupService.expireExpiredAdvertisements();

      const duration = Date.now() - startTime;
      this.logger.log(`✓ Expired ${expiredCount} advertisements in ${duration}ms`);

      return {
        success: true,
        expiredCount,
        duration,
      };
    } catch (error: any) {
      this.logger.error('Failed to expire advertisements:', error.message);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed:`, result);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Job ${job.id} (${job.name}) started`);
  }
}