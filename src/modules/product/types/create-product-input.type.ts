import { product_status } from "@prisma/client";
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
  status?: product_status;
  userId: number; 
  agencyId?: number;
};