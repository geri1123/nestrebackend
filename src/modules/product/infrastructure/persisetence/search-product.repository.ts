// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
// import { ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
// import { SearchFiltersDto } from '../../dto/product-filters.dto';
// import { SupportedLang } from '../../../../locales';
// import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
// import { SearchFiltersResolver } from '../search/search-filters-resolver.service';
// import { ProductSearchQueryBuilder } from '../search/product-search-query.builder';

// @Injectable()
// export class SearchProductRepository implements ISearchProductRepository {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly productClicksService: ProductClicksService,
//     private readonly queryBuilder: ProductSearchQueryBuilder,
//   ) {}

//   async searchProducts(
//     filters: SearchFiltersDto,
//     language: SupportedLang,
//     isProtectedRoute: boolean = false,
//   ): Promise<any[]> {
  

//     const whereConditions: any = this.queryBuilder.build(
//       filters,
//       language,
//       isProtectedRoute,
//     );
//     console.log(' WHERE CONDITIONS:', JSON.stringify(whereConditions, null, 2));

//     const secondaryOrderBy: any[] = [];
//     if (filters.sortBy && filters.sortBy !== 'most_clicks') {
//       switch (filters.sortBy) {
//         case 'price_asc':
//           secondaryOrderBy.push({ price: 'asc' });
//           break;
//         case 'price_desc':
//           secondaryOrderBy.push({ price: 'desc' });
//           break;
//         case 'date_asc':
//           secondaryOrderBy.push({ createdAt: 'asc' });
//           break;
//         case 'date_desc':
//           secondaryOrderBy.push({ createdAt: 'desc' });
//           break;
//       }
//     } else {
//       secondaryOrderBy.push({ createdAt: 'desc' });
//     }

//     const allProducts = await this.prisma.product.findMany({
//       where: whereConditions,
//       orderBy: secondaryOrderBy,
//       select: {
//         id: true,
//         title: true,
//         price: true,
//         status: true,
//         description: true,
//         streetAddress: true,
//         createdAt: true,
//         updatedAt: true,
//         userId: true,
//         buildYear: true,
//         area: true,
//         agencyId: true,
//         productImage: { take: 2, select: { imageUrl: true } },
//         city: { select: { name: true } },
//         subcategory: {
//           select: {
//             slug: true,
//             categoryId: true,
//             subcategoryTranslation: {
//               where: { language },
//               select: { name: true },
//               take: 1,
//             },
//             category: {
//               select: {
//                 slug: true,
//                 categoryTranslation: {
//                   where: { language },
//                   select: { name: true },
//                   take: 1,
//                 },
//               },
//             },
//           },
//         },
//         listingType: {
//           select: {
//             slug: true,
//             listingTypeTranslation: {
//               where: { language },
//               select: { name: true },
//               take: 1,
//             },
//           },
//         },
//         productAttributeValue: {
//           select: {
//             attributes: {
//               select: {
//                 code: true,
//                 attributeTranslation: {
//                   where: { language },
//                   select: { name: true },
//                   take: 1,
//                 },
//               },
//             },
//             attributeValues: {
//               select: {
//                 valueCode: true,
//                 attributeValueTranslations: {
//                   where: { language },
//                   select: { name: true },
//                   take: 1,
//                 },
//               },
//             },
//           },
//         },
//         user: {
//           select: {
//             username: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             phone: true,
//             role: true,
//             status: true,
//           },
//         },
//         agency: {
//           select: {
//             agencyName: true,
//             logo: true,
//             address: true,
//             status: true,
//             phone: true,
//             createdAt: true,
//           },
//         },
//         advertisements: {
//           where: {
//             status: 'active',
//             startDate: { lte: new Date() },
//             endDate: { gte: new Date() },
//           },
//           select: {
//             id: true,
//             startDate: true,
//             endDate: true,
//             status: true,
//             adType: true,
//           },
//           orderBy: { endDate: 'desc' },
//           take: 1,
//         },
//       },
//     });

    

//     const productIds = allProducts.map((p) => p.id);
//     const clicksMap = await this.productClicksService.getClicksForProducts(productIds);

//     const productsWithClicks = allProducts.map((p) => ({
//       ...p,
//       clickCount: clicksMap.get(String(p.id)) || 0,
//     }));

//     const sortedProducts = productsWithClicks.sort((a, b) => {
//       const aHasAd = a.advertisements && a.advertisements.length > 0;
//       const bHasAd = b.advertisements && b.advertisements.length > 0;

//       if (aHasAd && !bHasAd) return -1;
//       if (!aHasAd && bHasAd) return 1;

//       if (filters.sortBy === 'most_clicks') {
//         return b.clickCount - a.clickCount;
//       }

//       return 0;
//     });

//     const paginatedProducts = sortedProducts.slice(
//       filters.offset!,
//       filters.offset! + filters.limit!,
//     );

//     console.log(' PRODUCTS RETURNED (paginated):', paginatedProducts.length);

//     return paginatedProducts;
//   }

//   async getProductsCount(
//     filters: SearchFiltersDto,
//     language: SupportedLang,
//     isProtectedRoute: boolean = false,
//   ): Promise<number> {

//     const whereConditions: any = this.queryBuilder.build(
//       filters,
//       language,
//       isProtectedRoute,
//     );
//     const count = await this.prisma.product.count({ where: whereConditions });
//     console.log(' TOTAL COUNT FOR FILTERS:', count);
//     return count;
//   }
// }
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
import { ProductSearchQueryBuilder } from '../search/product-search-query.builder';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchProductRepository implements ISearchProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productClicksService: ProductClicksService,
    private readonly queryBuilder: ProductSearchQueryBuilder,
  ) {}

  private readonly activeAd = {
    status: 'active' as const,
    startDate: { lte: new Date() },
    endDate: { gte: new Date() },
  };

  private buildAdWheres(whereConditions: any) {
    return {
      adWhere: {
        ...whereConditions,
        advertisements: { some: this.activeAd },
      },
      regularWhere: {
        ...whereConditions,
        advertisements: { none: this.activeAd },
      },
    };
  }

  private getOrderBy(sortBy?: string): any[] {
    switch (sortBy) {
      case 'price_asc':   return [{ price: 'asc' }];
      case 'price_desc':  return [{ price: 'desc' }];
      case 'date_asc':    return [{ createdAt: 'asc' }];
      case 'date_desc':   return [{ createdAt: 'desc' }];
      case 'most_clicks': return [{ clickCount: 'desc' }, { createdAt: 'desc' }];
      default:            return [{ createdAt: 'desc' }];
    }
  }

  private getSelect(language: SupportedLang): Prisma.ProductSelect {
    return {
      id: true,
      clickCount: true,
      title: true,
      price: true,
      status: true,
      description: true,
      streetAddress: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      buildYear: true,
      area: true,
      agencyId: true,
      productImage: { take: 2, select: { imageUrl: true } },
      city: { select: { name: true } },
      subcategory: {
        select: {
          slug: true,
          categoryId: true,
          subcategoryTranslation: {
            where: { language },
            select: { name: true },
            take: 1,
          },
          category: {
            select: {
              slug: true,
              categoryTranslation: {
                where: { language },
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      },
      listingType: {
        select: {
          slug: true,
          listingTypeTranslation: {
            where: { language },
            select: { name: true },
            take: 1,
          },
        },
      },
      productAttributeValue: {
        select: {
          attributes: {
            select: {
              code: true,
              attributeTranslation: {
                where: { language },
                select: { name: true },
                take: 1,
              },
            },
          },
          attributeValues: {
            select: {
              valueCode: true,
              attributeValueTranslations: {
                where: { language },
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      },
      user: {
        select: {
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
        },
      },
      agency: {
        select: {
          agencyName: true,
          logo: true,
          address: true,
          status: true,
          phone: true,
          createdAt: true,
        },
      },
      advertisements: {
        where: {
          status: 'active',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          adType: true,
        },
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    };
  }

  async searchProducts(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false,
  ): Promise<any[]> {
    const whereConditions = this.queryBuilder.build(filters, language, isProtectedRoute);
    const { adWhere, regularWhere } = this.buildAdWheres(whereConditions);
    const orderBy = this.getOrderBy(filters.sortBy);

    const limit = filters.limit!;
    const offset = filters.offset!;

    // how many ad products exist matching this filter
    const totalAds = await this.prisma.product.count({ where: adWhere });

    // calculate how many ads and regular products to fetch for this page
    const adsSkipped   = Math.min(offset, totalAds);
    const adsToShow    = Math.min(Math.max(totalAds - adsSkipped, 0), limit);
    const regularToShow  = limit - adsToShow;
    const regularSkipped = Math.max(offset - totalAds, 0);

    const [adProducts, regularProducts] = await Promise.all([
      adsToShow > 0
        ? this.prisma.product.findMany({
            where: adWhere,
            orderBy,
            take: adsToShow,
            skip: adsSkipped,
            select: this.getSelect(language),
          })
        : Promise.resolve([]),

      regularToShow > 0
        ? this.prisma.product.findMany({
            where: regularWhere,
            orderBy,
            take: regularToShow,
            skip: regularSkipped,
            select: this.getSelect(language),
          })
        : Promise.resolve([]),
    ]);

    const allProducts = [...adProducts, ...regularProducts] as any[];

    // enrich with click counts
    const productIds = allProducts.map((p) => p.id);
    const clicksMap = await this.productClicksService.getClicksForProducts(productIds);

    return allProducts.map((p) => ({
      ...p,
      clickCount: clicksMap.get(String(p.id)) ?? p.clickCount ?? 0,
    }));
  }

  async getProductsCount(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false,
  ): Promise<number> {
    const whereConditions = this.queryBuilder.build(filters, language, isProtectedRoute);
    return this.prisma.product.count({ where: whereConditions });
  }
}