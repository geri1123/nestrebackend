import { SupportedLang } from '../../../../locales';
import { ProductEntity } from '../entities/product.entity';
import { SearchFiltersDto } from '../../dto/product-filters.dto';

export interface IProductRepository {
  create(entity: ProductEntity): Promise<number>;
  findById(id: number): Promise<ProductEntity | null>;
  findByIdWithDetails(id: number, language: SupportedLang): Promise<any>;
  update(id: number, entity: ProductEntity): Promise<void>;
  search(filters: SearchFiltersDto, language: SupportedLang, isProtectedRoute: boolean): Promise<any[]>;
  count(filters: SearchFiltersDto, language: SupportedLang, isProtectedRoute: boolean): Promise<number>;
  getForPermissionCheck(id: number): Promise<{ id: number; userId: number | null; agencyId: number | null } | null>;
}

export const PRODUCT_REPOSITORY_TOKEN = Symbol('IProductRepository');