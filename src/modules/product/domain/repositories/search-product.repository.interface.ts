// modules/product/domain/repositories/search-product.repository.interface.ts
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';

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