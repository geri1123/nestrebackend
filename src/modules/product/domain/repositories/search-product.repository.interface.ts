import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
export const SEARCH_PRODUCT_REPO = Symbol('SEARCH_PRODUCT_REPO');
export interface ISearchProductRepository {
  searchProducts(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean
  ): Promise<any[]>;
  
  getProductsCount(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean
  ): Promise<number>;
}