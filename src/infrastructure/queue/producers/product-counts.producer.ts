import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  PRODUCT_COUNTS_JOBS,
  QUEUES,
} from '../constants/queue-names.constant';
import {
  ProductCreatedPayload,
  ProductDeletedPayload,
  ProductStatusChangedPayload,
  ReconcileCountsPayload,
} from '../types/product-counts-payloads.type';

@Injectable()
export class ProductCountsProducer implements OnModuleInit {
  private readonly logger = new Logger(ProductCountsProducer.name);

  constructor(
    @InjectQueue(QUEUES.PRODUCT_COUNTS) private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    // Schedule recurring reconciliation + a one-off reconcile-on-boot.
    // Delayed so the app finishes booting before workers start hitting DB.
    setTimeout(() => this.setupRecurringJobs(), 5000);
  }

  // ─── Hot-path emitters (called from product use-cases) ───────────────────
  // These return immediately; the heavy work happens in the worker.

  async emitCreated(payload: ProductCreatedPayload): Promise<void> {
    await this.queue.add(PRODUCT_COUNTS_JOBS.CREATED, payload, {
      // Delta jobs are idempotent if dedupe-keyed by product id, but we
      // don't dedupe here since each create is a distinct event.
      removeOnComplete: { age: 600, count: 1000 },
      removeOnFail: { age: 86400, count: 200 },
    });
  }

  async emitStatusChanged(payload: ProductStatusChangedPayload): Promise<void> {
    if (payload.oldStatus === payload.newStatus) return;
    await this.queue.add(PRODUCT_COUNTS_JOBS.STATUS_CHANGED, payload, {
      removeOnComplete: { age: 600, count: 1000 },
      removeOnFail: { age: 86400, count: 200 },
    });
  }

  async emitDeleted(payload: ProductDeletedPayload): Promise<void> {
    await this.queue.add(PRODUCT_COUNTS_JOBS.DELETED, payload, {
      removeOnComplete: { age: 600, count: 1000 },
      removeOnFail: { age: 86400, count: 200 },
    });
  }

  /** Manual trigger for on-demand reconciliation (e.g. admin endpoint). */
  async triggerReconcile(payload: ReconcileCountsPayload = {}) {
    return this.queue.add(PRODUCT_COUNTS_JOBS.RECONCILE, payload, {
      priority: 1,
    });
  }

  // ─── Recurring jobs ──────────────────────────────────────────────────────

  private async setupRecurringJobs() {
    try {
      this.logger.log('Setting up product-counts recurring jobs...');

      // Wipe pre-existing schedulers in case the cron pattern changed
      const existing = await this.queue.getJobSchedulers();
      for (const job of existing) {
        await this.queue.removeJobScheduler(job.key);
      }

      // Reconcile from DB every hour. Distributed lock inside the processor
      // ensures only one instance actually runs the heavy work.
      await this.queue.upsertJobScheduler(
        PRODUCT_COUNTS_JOBS.RECONCILE,
        { pattern: '0 * * * *' }, // top of every hour
        {
          name: PRODUCT_COUNTS_JOBS.RECONCILE,
          data: {} satisfies ReconcileCountsPayload,
        },
      );
      this.logger.log('✓ Scheduled: reconcile-counts (hourly)');

      // Bootstrap reconcile shortly after boot so cold caches get filled.
      await this.queue.add(
        PRODUCT_COUNTS_JOBS.RECONCILE,
        {} satisfies ReconcileCountsPayload,
        { delay: 2000, priority: 1 },
      );
      this.logger.log('✓ Bootstrap reconcile queued');
    } catch (err: any) {
      this.logger.error(`Failed to setup recurring jobs: ${err.message}`);
    }
  }
}