import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { ICatRepository } from "./Icategory.repository";
import { LanguageCode } from "@prisma/client";
import { product_status } from "@prisma/client";
import { CategoryDto } from "../../modules/filters/dto/filters.dto.js";
@Injectable()
export class CategoryRepository implements ICatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(
    language: LanguageCode = LanguageCode.al,
    status?: product_status
  ): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      include: {
        categorytranslation: {
          where: { language },
          select: { name: true, slug: true },
        },
        subcategory: {
          include: {
            subcategorytranslation: {
              where: { language },
              select: { name: true, slug: true },
            },
            _count: {
              select: {
                product: {
                  where: status ? { status } : undefined,
                },
              },
            },
          },
        },
      },
    });

    return categories.map((category) => {
      const subcategories = category.subcategory.map((subcat) => {
        const [translation] = subcat.subcategorytranslation;
        return {
          id: subcat.id,
          name: translation?.name ?? "No translation",
          slug: translation?.slug ?? null,
          categoryId: subcat.categoryId,
          productCount: subcat._count.product,
        };
      });

      const totalCategoryProducts = subcategories.reduce(
        (sum, s) => sum + s.productCount,
        0
      );

      const [translation] = category.categorytranslation;

      return {
        id: category.id,
        name: translation?.name ?? "No translation",
        slug: translation?.slug ?? null,
        productCount: totalCategoryProducts,
        subcategories,
      };
    });
  }
}
