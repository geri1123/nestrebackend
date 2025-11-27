import { LanguageCode } from "@prisma/client";
import { SavedProductEntity } from "../../modules/saved-product/domain/save-product.entity";
import { SupportedLang } from "../../locales";
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
  ): Promise<any[]>; // Return raw data for read models
}