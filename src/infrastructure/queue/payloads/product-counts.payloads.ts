import { ProductStatus } from '@prisma/client';

/**
 * Payload shapes for jobs enqueued on the product-counts queue.
 */

export interface ProductCreatedPayload {
  subcategoryId: number;
  listingTypeId: number;
  status: ProductStatus;
}

export interface ProductStatusChangedPayload {
  subcategoryId: number;
  listingTypeId: number;
  oldStatus: ProductStatus;
  newStatus: ProductStatus;
}

export interface ProductDeletedPayload {
  subcategoryId: number;
  listingTypeId: number;
  status: ProductStatus;
}

export interface ReconcileCountsPayload {
  /** Optional — if omitted, reconciles all statuses. */
  statuses?: ProductStatus[];
}