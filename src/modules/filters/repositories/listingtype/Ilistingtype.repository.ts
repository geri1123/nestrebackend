import { LanguageCode, ProductStatus } from '@prisma/client';
import { ListingTypeDto } from '../../dto/filters.dto';
export const LISTING_TYPE_REPO = Symbol('LISTING_TYPE_REPO');
export interface IListingTypeRepository {
  getAllListingTypes(language: LanguageCode): Promise<any[]>;
  
  getListingTypeCounts(status: ProductStatus): Promise<Record<number, number>>;
}