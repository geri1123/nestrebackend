import { ProductStatus } from "@prisma/client";
export type CreateProductInput = {
  title: string;
  price: number;
  description?: string;
  cityId: number;
  subcategoryId: number;
  listingTypeId: number;
  streetAddress?: string;
  area?: number;
  buildYear?: number;
  status?: ProductStatus;
  userId: number; 
  agencyId?: number;
};