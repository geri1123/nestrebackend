import { LanguageCode, product_status } from '@prisma/client';
import { ListingTypeDto } from '../../filters/dto/filters.dto';
export interface IListingTypeRepository {
  getAllListingTypes(
    language?: LanguageCode,
    status?: product_status,
  ): Promise<ListingTypeDto[]>;
}