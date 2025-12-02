import { LanguageCode, product_status } from "@prisma/client";

export interface ICatRepository {
  getAllCategories(
    language: LanguageCode,
    status?: product_status
  ): Promise<{
    id: number;
    name: string;
    slug: string | null;
    productCount: number;
    subcategories: {
      id: number;
      name: string;
      slug: string | null;
      categoryId: number;
      productCount: number;
    }[];
  }[]>;
}