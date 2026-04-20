
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CityCount, ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
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
  };
async getCityCounts(
  filters: SearchFiltersDto,
  isProtectedRoute: boolean = false,
): Promise<CityCount[]> {
  const where = this.queryBuilder.build(filters, 'en', isProtectedRoute);

  const grouped = await this.prisma.product.groupBy({
    by: ['cityId'],
    where,                   
    _count: {
      cityId: true,
    },
    orderBy: {
      _count: {
        cityId: 'desc',
      },
    },
  });

  return grouped.map(g => ({
    cityId: g.cityId,
    count: g._count.cityId,
  }));
}
}