import { SavedProductEntity } from "../entities/save-product.entity";
import { SupportedLang } from "../../../../locales";
export const SAVED_PRODUCT_REPO = 'ISavedProductRepository';

export interface ISavedProductRepository {
   findByUserAndProduct(userId: number, productId: number): Promise<SavedProductEntity | null>;
  save(entity: SavedProductEntity): Promise<SavedProductEntity>;
  delete(userId: number, productId: number): Promise<void>;
  countByUser(userId: number): Promise<number>;
  findByUserPaginated(
    userId: number,
    language: SupportedLang,
    skip: number,
    take: number
  ): Promise<any[]>; 
}