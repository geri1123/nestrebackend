import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProductStatus } from '@prisma/client';
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
import {
  IProductCountsRepository,
  PRODUCT_COUNTS_REPO,
} from '../../../modules/filters/repositories/counts/Iproduct-counts.repository';
import {
  CATEGORY_REPO,
  type ICatRepository,
} from '../../../modules/filters/repositories/category/Icategory.repository';
import {
  LISTING_TYPE_REPO,
  type IListingTypeRepository,
} from '../../../modules/filters/repositories/listingtype/Ilistingtype.repository';

const ALL_STATUSES: ProductStatus[] = [
  'active',
  'draft',
  'pending',
  'sold',
  'inactive',
] as ProductStatus[];

/**
 * High concurrency: delta jobs are tiny atomic Redis ops, so we let many
 * run in parallel. Reconciliation jobs are heavier but gated by a
 * distributed lock, so duplicates from multiple instances are no-ops.
 */
@Processor(QUEUES.PRODUCT_COUNTS, {
  concurrency: 50,
})
export class ProductCountsProcessor extends WorkerHost {
  private readonly logger = new Logger(ProductCountsProcessor.name);

  constructor(
    @Inject(PRODUCT_COUNTS_REPO)
    private readonly counts: IProductCountsRepository,
    @Inject(CATEGORY_REPO)
    private readonly categoryRepo: ICatRepository,
    @Inject(LISTING_TYPE_REPO)
    private readonly listingTypeRepo: IListingTypeRepository,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case PRODUCT_COUNTS_JOBS.CREATED:
        return this.handleCreated(job.data as ProductCreatedPayload);
      case PRODUCT_COUNTS_JOBS.STATUS_CHANGED:
        return this.handleStatusChanged(
          job.data as ProductStatusChangedPayload,
        );
      case PRODUCT_COUNTS_JOBS.DELETED:
        return this.handleDeleted(job.data as ProductDeletedPayload);
      case PRODUCT_COUNTS_JOBS.RECONCILE:
        return this.handleReconcile(job.data as ReconcileCountsPayload);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        return { success: false, message: 'unknown job' };
    }
  }

  private async handleCreated(payload: ProductCreatedPayload) {
    await this.counts.applyCreate(payload);
    return { ok: true };
  }

  private async handleStatusChanged(payload: ProductStatusChangedPayload) {
    await this.counts.applyStatusChange(payload);
    return { ok: true };
  }

  private async handleDeleted(payload: ProductDeletedPayload) {
    await this.counts.applyDelete(payload);
    return { ok: true };
  }

  /**
   * Recompute counts from the DB and atomically replace the Redis hashes.
   * Protected by a distributed lock so only one instance runs the work
   * even if every pod fires the same cron tick.
   */
  private async handleReconcile(payload: ReconcileCountsPayload) {
    const acquired = await this.counts.acquireReconcileLock(/* ttl */ 300);
    if (!acquired) {
      this.logger.debug('Reconcile skipped — lock held by another instance');
      return { ok: true, skipped: true };
    }

    const start = Date.now();
    const statuses = payload.statuses?.length ? payload.statuses : ALL_STATUSES;

    try {
      // Sequential per-status to avoid hammering the DB with parallel scans.
      for (const status of statuses) {
        const [{ subcategoryCountMap }, listingTypeMap] = await Promise.all([
          this.categoryRepo.getCategoryCounts(status),
          this.listingTypeRepo.getListingTypeCounts(status),
        ]);

        await this.counts.replaceCounts({
          status,
          subcategoryCounts: subcategoryCountMap,
          listingTypeCounts: listingTypeMap,
        });
      }

      const duration = Date.now() - start;
      this.logger.log(
        `Reconciliation complete in ${duration}ms (statuses=${statuses.join(',')})`,
      );
      return { ok: true, duration };
    } catch (err: any) {
      this.logger.error(`Reconciliation failed: ${err.message}`, err.stack);
      throw err;
    } finally {
      await this.counts.releaseReconcileLock();
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }
}