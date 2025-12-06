import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
import { ProductClicksService } from '../../../product-clicks/product-clicks.service';

@Injectable()
export class SearchProductRepository implements ISearchProductRepository {
  constructor(
    private prisma: PrismaService,
    private productClicksService: ProductClicksService
  ) {}

  async searchProducts(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false
  ): Promise<any[]> {
    const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);

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
        productimage: { take: 2, select: { imageUrl: true } },
        city: { select: { name: true } },
        subcategory: {
          select: {
            slug: true,
            subcategorytranslation: { where: { language }, select: { name: true }, take: 1 },
            category: {
              select: {
                slug: true,
                categorytranslation: { where: { language }, select: { name: true }, take: 1 },
              },
            },
          },
        },
        listing_type: {
          select: {
            slug: true,
            listing_type_translation: { where: { language }, select: { name: true }, take: 1 },
          },
        },
        productattributevalue: {
          select: {
            attributes: {
              select: {
                code: true,
                attributeTranslation: { where: { language }, select: { name: true }, take: 1 },
              },
            },
            attribute_values: {
              select: {
                value_code: true,
                attributeValueTranslations: { where: { language }, select: { name: true }, take: 1 },
              },
            },
          },
        },
        user: { select: { username: true } },
        agency: { select: { agency_name: true, logo: true } },
        advertisements: {
          where: {
            status: 'active',
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            adType: true
          },
          orderBy: { endDate: 'desc' },
          take: 1
        }
      },
    });

    const productIds = allProducts.map(p => p.id);
    const clicksMap = await this.productClicksService.getClicksForProducts(productIds);

    const productsWithClicks = allProducts.map(p => ({
      ...p,
      clickCount: clicksMap.get(String(p.id)) || 0
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
      filters.offset,
      filters.offset! + filters.limit!
    );

    return paginatedProducts;
  }

  async getProductsCount(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false
  ): Promise<number> {
    const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);
    return this.prisma.product.count({ where: whereConditions });
  }

  private buildWhereConditions(filters: SearchFiltersDto, language: SupportedLang, isProtectedRoute: boolean = false) {
    const whereConditions: any = {};

    if (filters.areaLow !== undefined || filters.areaHigh !== undefined) {
      whereConditions.area = {};
      if (filters.areaLow !== undefined) whereConditions.area.gte = filters.areaLow;
      if (filters.areaHigh !== undefined) whereConditions.area.lte = filters.areaHigh;
    }

    if (filters.subcategoryId || filters.categoryId) {
      whereConditions.subcategory = {};
      if (filters.subcategoryId) {
        whereConditions.subcategory.id = filters.subcategoryId;
      }
      if (filters.categoryId) {
        whereConditions.subcategory.categoryId = filters.categoryId;
      }
    }

    if (filters.listingTypeId) {
      whereConditions.listingTypeId = filters.listingTypeId;
    }

    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      const attributeConditions: any[] = [];
      for (const [attributeIdStr, valueIds] of Object.entries(filters.attributes)) {
        const attributeId = Number(attributeIdStr);
        const valueArray = Array.isArray(valueIds)
          ? valueIds.map((v) => Number(v))
          : [Number(valueIds)];

        attributeConditions.push({
          productattributevalue: {
            some: {
              attributeId,
              attributeValueId: { in: valueArray },
            },
          },
        });
      }

      if (attributeConditions.length > 0) {
        whereConditions.AND = attributeConditions;
      }
    }

    if (filters.pricelow !== undefined || filters.pricehigh !== undefined) {
      whereConditions.price = {};
      if (filters.pricelow !== undefined) whereConditions.price.gte = filters.pricelow;
      if (filters.pricehigh !== undefined) whereConditions.price.lte = filters.pricehigh;
    }

    if (filters.cities || filters.country) {
      whereConditions.city = {};
      if (filters.cities && filters.cities.length > 0) {
        whereConditions.city.name =
          filters.cities.length === 1
            ? filters.cities[0]
            : { in: filters.cities };
      }
      if (filters.country) {
        whereConditions.city.country = {
          name: filters.country.toLowerCase(),
        };
      }
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    } else if (isProtectedRoute) {
      whereConditions.status = { in: ['active', 'draft', 'pending', 'sold', 'inactive'] };
    } else {
      whereConditions.status = 'active';
    }

    if (filters.userId) whereConditions.userId = filters.userId;

    whereConditions.user = {
      status: { not: 'suspended' },
    };

    whereConditions.AND = [
      ...(whereConditions.AND || []),
      {
        OR: [
          { agency: null },
          { agency: { status: { not: 'suspended' } } },
        ],
      },
    ];

    return whereConditions;
  }
}