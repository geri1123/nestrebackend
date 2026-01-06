import { LanguageCode, product_status } from "@prisma/client";
export const CATEGORY_REPO = Symbol('CATEGORY_REPO');
export interface ICatRepository {
  // Get category structure WITHOUT counts (for caching)
  getAllCategories(language: LanguageCode): Promise<any[]>;
  
  // Get ONLY counts (fresh, not cached)
  getCategoryCounts(status: product_status): Promise<{
    subcategoryCountMap: Record<number, number>;
    categoryCountMap: Record<number, number>;
  }>;
}