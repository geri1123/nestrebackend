import { LanguageCode, product_status } from "@prisma/client";
export const CATEGORY_REPO = Symbol('CATEGORY_REPO');
export interface ICatRepository {
 getAllCategories(
    language: LanguageCode,
    status?: product_status,
  ): Promise<any[]>
}