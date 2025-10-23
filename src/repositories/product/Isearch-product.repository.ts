import { SupportedLang } from "../../locales";
import { SearchFiltersDto } from "../../product/dto/product-filters.dto";

export interface IsearchProductRepository{
    searchProducts(filters: SearchFiltersDto, language: SupportedLang):Promise<any[]>;
}