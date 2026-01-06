import { LanguageCode, product_status } from '@prisma/client';
import { ListingTypeDto } from '../../dto/filters.dto';
export const LISTING_TYPE_REPO = Symbol('LISTING_TYPE_REPO');
export interface IListingTypeRepository {
  // Get listing type structure WITHOUT counts (for caching)
  getAllListingTypes(language: LanguageCode): Promise<any[]>;
  
  // Get ONLY counts (fresh, not cached)
  getListingTypeCounts(status: product_status): Promise<Record<number, number>>;
}