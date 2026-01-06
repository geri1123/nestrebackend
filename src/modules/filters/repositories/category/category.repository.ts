import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { ICatRepository } from "./Icategory.repository";
import { LanguageCode } from "@prisma/client";
import { product_status } from "@prisma/client";

// @Injectable()
// export class CategoryRepository implements ICatRepository {
//   constructor(private readonly prisma: PrismaService) {}

//   async getAllCategories(
//     language: LanguageCode,
//     status?: product_status,
//   ) {
//     return this.prisma.category.findMany({
//       select: {
//         id: true,
//         slug: true,
//         categorytranslation: {
//           where: { language },
//           select: { 
//             name: true
          
//           },
//         },
//         subcategory: {
//           select: {
//             id: true,
//             categoryId: true,
//             slug: true,  
//             subcategorytranslation: {
//               where: { language },
//               select: { 
//                 name: true
                
//               },
//             },
//             _count: {
//               select: {
//                 product: {
//                   where: status ? { status } : undefined,
//                 },
//               },
//             },
//           },
//         },
//       },
//     });
//   }
// }
// category.repository.ts
@Injectable()
export class CategoryRepository implements ICatRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Get category structure WITHOUT counts (for caching)
  async getAllCategories(language: LanguageCode) {
    return this.prisma.category.findMany({
      select: {
        id: true,
        slug: true,
        categorytranslation: {
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
            subcategorytranslation: {
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

  // Get ONLY counts (fresh, not cached)
  async getCategoryCounts(status: product_status = product_status.active) {
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

    // Build maps for O(1) lookup
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