import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';
import { SearchFiltersResolver } from '../search/search-filters-resolver.service';
import { ProductSearchQueryBuilder } from '../search/product-search-query.builder';
@Injectable()
export class SearchProductRepository implements ISearchProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productClicksService: ProductClicksService,
    // private readonly filtersResolver: SearchFiltersResolver,
    private readonly queryBuilder: ProductSearchQueryBuilder,
  ) {}

  async searchProducts(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false,
  ): Promise<any[]> {
    //Resolve slugs/codes to IDs before building conditions
    // await this.filtersResolver.resolve(filters);

    const whereConditions: any = this.queryBuilder.build(
      filters,
      language,
      isProtectedRoute,
    );
    console.log('🔎 WHERE CONDITIONS:', JSON.stringify(whereConditions, null, 2));

    const secondaryOrderBy: any[] = [];
    if (filters.sortBy && filters.sortBy !== 'most_clicks') {
      switch (filters.sortBy) {
        case 'price_asc':
          secondaryOrderBy.push({ price: 'asc' });
          break;
        case 'price_desc':
          secondaryOrderBy.push({ price: 'desc' });
          break;
        case 'date_asc':
          secondaryOrderBy.push({ createdAt: 'asc' });
          break;
        case 'date_desc':
          secondaryOrderBy.push({ createdAt: 'desc' });
          break;
      }
    } else {
      secondaryOrderBy.push({ createdAt: 'desc' });
    }

    const allProducts = await this.prisma.product.findMany({
      where: whereConditions,
      orderBy: secondaryOrderBy,
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        description: true,
        streetAddress: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        buildYear: true,
        agencyId: true,
        productimage: { take: 2, select: { imageUrl: true } },
        city: { select: { name: true } },
        subcategory: {
          select: {
            slug: true,
            subcategorytranslation: {
              where: { language },
              select: { name: true },
              take: 1,
            },
            category: {
              select: {
                slug: true,
                categorytranslation: {
                  where: { language },
                  select: { name: true },
                  take: 1,
                },
              },
            },
          },
        },
        listing_type: {
          select: {
            slug: true,
            listing_type_translation: {
              where: { language },
              select: { name: true },
              take: 1,
            },
          },
        },
        productattributevalue: {
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
            attribute_values: {
              select: {
                value_code: true,
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
            first_name: true,
            last_name: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        agency: {
          select: {
            agency_name: true,
            logo: true,
            address: true,
            status: true,
            phone: true,
            created_at: true,
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
      },
    });

    console.log(' PRODUCTS FOUND BEFORE CLICK MERGE:', allProducts.length);

    const productIds = allProducts.map((p) => p.id);
    const clicksMap = await this.productClicksService.getClicksForProducts(productIds);

    const productsWithClicks = allProducts.map((p) => ({
      ...p,
      clickCount: clicksMap.get(String(p.id)) || 0,
    }));

    const sortedProducts = productsWithClicks.sort((a, b) => {
      const aHasAd = a.advertisements && a.advertisements.length > 0;
      const bHasAd = b.advertisements && b.advertisements.length > 0;

      if (aHasAd && !bHasAd) return -1;
      if (!aHasAd && bHasAd) return 1;

      if (filters.sortBy === 'most_clicks') {
        return b.clickCount - a.clickCount;
      }

      return 0;
    });

    const paginatedProducts = sortedProducts.slice(
      filters.offset!,
      filters.offset! + filters.limit!,
    );

    console.log(' PRODUCTS RETURNED (paginated):', paginatedProducts.length);

    return paginatedProducts;
  }

  async getProductsCount(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false,
  ): Promise<number> {
    // await this.filtersResolver.resolve(filters);

    const whereConditions: any = this.queryBuilder.build(
      filters,
      language,
      isProtectedRoute,
    );
    const count = await this.prisma.product.count({ where: whereConditions });
    console.log(' TOTAL COUNT FOR FILTERS:', count);
    return count;
  }
}
