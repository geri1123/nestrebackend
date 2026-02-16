import { LanguageCode, ProductStatus } from "@prisma/client";
export const CATEGORY_REPO = Symbol('CATEGORY_REPO');
export interface ICatRepository {
  // Get category structure WITHOUT counts (for caching)
  getAllCategories(language: LanguageCode): Promise<any[]>;
  
  // Get ONLY counts (fresh, not cached)
  getCategoryCounts(status: ProductStatus): Promise<{
    subcategoryCountMap: Record<number, number>;
    categoryCountMap: Record<number, number>;
  }>;
}