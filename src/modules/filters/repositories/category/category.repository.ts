import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { ICatRepository } from "./Icategory.repository";
import { LanguageCode } from "@prisma/client";
import { ProductStatus } from "@prisma/client";

@Injectable()
export class CategoryRepository implements ICatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(language: LanguageCode) {
    return this.prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        categoryTranslation: {
          where: { language },
          select: { 
            name: true
          },
        },
        subcategory: {
          select: {
            id: true,
            categoryId: true,
            slug: true,  
            subcategoryTranslation: {
              where: { language },
              select: { 
                name: true
              },
            },
           
          },
        },
      },
    });
  }

  async getCategoryCounts(status: ProductStatus = ProductStatus.active) {
    const subcategories = await this.prisma.subcategory.findMany({
      select: {
        id: true,
        categoryId: true,
        _count: {
          select: {
            product: {
              where: { status },
            },
          },
        },
      },
    });

    const subcategoryCountMap: Record<number, number> = {};
    const categoryCountMap: Record<number, number> = {};

    subcategories.forEach(sub => {
      const count = sub._count.product;
      subcategoryCountMap[sub.id] = count;
      categoryCountMap[sub.categoryId] = (categoryCountMap[sub.categoryId] || 0) + count;
    });

    return { subcategoryCountMap, categoryCountMap };
  }
}