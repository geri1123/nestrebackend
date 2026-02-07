import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CLEANUP_JOBS, QUEUES } from '../constants/queue-names.constant';

@Injectable()
export class CleanupProducer implements OnModuleInit {
  private readonly logger = new Logger(CleanupProducer.name);

  constructor(
    @InjectQueue(QUEUES.CLEANUP) private readonly cleanupQueue: Queue,
  ) {}

  async onModuleInit() {
    setTimeout(() => this.setupRecurringJobs(), 2000);
  }

  private async setupRecurringJobs() {
    try {
      this.logger.log('Setting up cleanup recurring jobs...');

      const existingJobs = await this.cleanupQueue.getJobSchedulers();
      for (const job of existingJobs) {
        await this.cleanupQueue.removeJobScheduler(job.key);
        this.logger.debug(`Removed existing job: ${job.name}`);
      }

      // Schedule: Delete inactive users every 5 minutes
      await this.cleanupQueue.upsertJobScheduler(
        CLEANUP_JOBS.DELETE_INACTIVE_USERS,
        {
          pattern: '*/5 * * * *', // Every 5 minutes
        },
        {
          name: CLEANUP_JOBS.DELETE_INACTIVE_USERS,
          data: {},
        },
      );

      this.logger.log('✓ Scheduled: delete-inactive-users (every 5 minutes)');

      // Schedule: Expire advertisements every 10 minutes
      await this.cleanupQueue.upsertJobScheduler(
        CLEANUP_JOBS.EXPIRE_ADS,
        {
          pattern: '*/10 * * * *', 
        },
        {
          name: CLEANUP_JOBS.EXPIRE_ADS,
          data: {},
        },
      );

      this.logger.log('✓ Scheduled: expire-ads (every 10 minutes)');

      // Verify scheduled jobs
      const scheduledJobs = await this.cleanupQueue.getJobSchedulers();
      this.logger.log(`Total recurring jobs: ${scheduledJobs.length}`);
    } catch (error: any) {
      this.logger.error('Failed to setup recurring jobs:', error.message);
      throw error;
    }
  }

  // Manual triggers
  async triggerDeleteInactiveUsers() {
    const job = await this.cleanupQueue.add(
      CLEANUP_JOBS.DELETE_INACTIVE_USERS,
      {},
      { priority: 1 },
    );
    this.logger.log(`Manual cleanup triggered (Job ID: ${job.id})`);
    return job;
  }

  async triggerExpireAds() {
    const job = await this.cleanupQueue.add(
      CLEANUP_JOBS.EXPIRE_ADS,
      {},
      { priority: 1 },
    );
    this.logger.log(`Manual ad expiration triggered (Job ID: ${job.id})`);
    return job;
  }

  // Get queue statistics
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.cleanupQueue.getWaitingCount(),
      this.cleanupQueue.getActiveCount(),
      this.cleanupQueue.getCompletedCount(),
      this.cleanupQueue.getFailedCount(),
      this.cleanupQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async getScheduledJobs() {
    const jobs = await this.cleanupQueue.getJobSchedulers();
    return jobs.map((job) => ({
      name: job.name,
      pattern: job.pattern,
      next: job.next,
      key: job.key,
    }));
  }
}