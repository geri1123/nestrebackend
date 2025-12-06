import { Product } from '../entities/product.entity';
import { SupportedLang } from '../../../../locales';

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findByIdWithDetails(id: number, language: SupportedLang): Promise<any>;
  findForPermissionCheck(id: number): Promise<{ id: number; userId: number | null; agencyId: number | null } | null>;
  update(id: number, data: Partial<Product>): Promise<Product>;
  delete(id: number): Promise<void>;
}

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