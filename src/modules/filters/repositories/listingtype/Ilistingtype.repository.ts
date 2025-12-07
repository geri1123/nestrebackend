import { LanguageCode, product_status } from '@prisma/client';
import { ListingTypeDto } from '../../dto/filters.dto';
export const LISTING_TYPE_REPO = Symbol('LISTING_TYPE_REPO');
export interface IListingTypeRepository {
  getAllListingTypes(
    language?: LanguageCode,
    status?: product_status,
  ): Promise<ListingTypeDto[]>;
}