import { ProductStatus } from '@prisma/client';
 
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
 