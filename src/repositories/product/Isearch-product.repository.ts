import { SupportedLang } from "../../locales";
import { SearchFiltersDto } from "../../modules/product/dto/product-filters.dto";

export interface IsearchProductRepository{
//      getProductForPermissionCheck(
//   id: number,
// ): Promise<{ id: number; userId: number | null; agencyId: number | null } | null>;
    searchProducts(filters: SearchFiltersDto, language: SupportedLang):Promise<any[]>;
}