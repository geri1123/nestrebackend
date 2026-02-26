import { Product } from '../entities/product.entity';
import { SupportedLang } from '../../../../locales';
export const PRODUCT_REPO = Symbol('PRODUCT_REPO');
export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findByIdWithDetails(id: number, language: SupportedLang): Promise<any>;
  findForPermissionCheck(id: number): Promise<{ id: number; userId: number | null; agencyId: number | null } | null>;
  update(id: number, data: Partial<Product>): Promise<Product>;
   deleteWithRelations(id: number): Promise<void>; 
  delete(id: number): Promise<void>;
}

