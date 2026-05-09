import { ProductStatus } from '@prisma/client';

export const PRODUCT_COUNTS_REPO = Symbol('PRODUCT_COUNTS_REPO');

export interface IProductCountsRepository {
  /** Apply a +1 increment for a newly created product. */
  applyCreate(args: {
    subcategoryId: number;
    listingTypeId: number;
    status: ProductStatus;
  }): Promise<void>;

  /** Apply a status transition (-1 from old, +1 to new). */
  applyStatusChange(args: {
    subcategoryId: number;
    listingTypeId: number;
    oldStatus: ProductStatus;
    newStatus: ProductStatus;
  }): Promise<void>;

  /** Apply a -1 decrement for a deleted product. */
  applyDelete(args: {
    subcategoryId: number;
    listingTypeId: number;
    status: ProductStatus;
  }): Promise<void>;

  /** Read current subcategory counts for a given status. Returns subcatId -> count. */
  getSubcategoryCounts(status: ProductStatus): Promise<Record<number, number>>;

  /** Read current listing-type counts for a given status. Returns listingTypeId -> count. */
  getListingTypeCounts(status: ProductStatus): Promise<Record<number, number>>;

  /**
   * Atomically replace stored counts for a status.
   * Used by the reconciliation worker after computing fresh counts from the DB.
   */
  replaceCounts(args: {
    status: ProductStatus;
    subcategoryCounts: Record<number, number>;
    listingTypeCounts: Record<number, number>;
  }): Promise<void>;

  /**
   * Try to acquire the reconciliation lock. Returns true if acquired.
   * Caller should release the lock when finished, even on error paths.
   */
  acquireReconcileLock(ttlSeconds: number): Promise<boolean>;
  releaseReconcileLock(): Promise<void>;

  /** True if no counts have been written yet for this status (cold cache). */
  isStatusInitialized(status: ProductStatus): Promise<boolean>;
}