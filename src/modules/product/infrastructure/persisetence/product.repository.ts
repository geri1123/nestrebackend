import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductEntity } from '../../domain/entities/product.entity';
import { SupportedLang } from '../../../../locales';
import { SearchFiltersDto } from '../../dto/product-filters.dto';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: ProductEntity): Promise<number> {
    const product = await this.prisma.product.create({
      data: {
        title: entity.title,
        price: entity.price,
        cityId: entity.cityId,
        subcategoryId: entity.subcategoryId,
        listingTypeId: entity.listingTypeId,
        description: entity.description,
        streetAddress: entity.streetAddress,
        area: entity.area,
        buildYear: entity.buildYear,
        status: entity.status,
        userId: entity.userId,
        agencyId: entity.agencyId,
      },
    });
    return product.id;
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) return null;

    return new ProductEntity(
      product.id,
      product.title,
      product.price,
      product.cityId,
      product.subcategoryId,
      product.listingTypeId,
      product.description || '',
      product.streetAddress || '',
      product.area,
      product.buildYear,
      product.status,
      product.userId,
      product.agencyId,
      product.createdAt,
      product.updatedAt,
    );
  }

  async findByIdWithDetails(id: number, language: SupportedLang): Promise<any> {
    return this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        userId: true,
        agencyId: true,
        description: true,
        streetAddress: true,
        createdAt: true,
        updatedAt: true,
        buildYear: true,
        productimage: { select: { imageUrl: true } },
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
        user: {
          select: {
            username: true,
            email: true,
            first_name: true,
            last_name: true,
            profile_img: true,
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
            phone: true,
            created_at: true,
            status: true,
          },
        },
      },
    });
  }

  async update(id: number, entity: ProductEntity): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        title: entity.title,
        price: entity.price,
        description: entity.description,
        streetAddress: entity.streetAddress,
        area: entity.area,
        buildYear: entity.buildYear,
        status: entity.status,
      },
    });
  }

  async search(filters: SearchFiltersDto, language: SupportedLang, isProtectedRoute: boolean): Promise<any[]> {
    const whereConditions = this.buildWhereConditions(filters, isProtectedRoute);
    const secondaryOrderBy = this.buildOrderBy(filters);

    return this.prisma.product.findMany({
      where: whereConditions,
      orderBy: secondaryOrderBy,
      skip: filters.offset,
      take: filters.limit,
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
            endDate: { gte: new Date() },
          },
          select: { id: true, startDate: true, endDate: true, status: true, adType: true },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
    });
  }

  async count(filters: SearchFiltersDto, language: SupportedLang, isProtectedRoute: boolean): Promise<number> {
    const whereConditions = this.buildWhereConditions(filters, isProtectedRoute);
    return this.prisma.product.count({ where: whereConditions });
  }

  async getForPermissionCheck(id: number): Promise<{ id: number; userId: number | null; agencyId: number | null } | null> {
    return this.prisma.product.findUnique({
      where: { id },
      select: { id: true, userId: true, agencyId: true },
    });
  }

  private buildWhereConditions(filters: SearchFiltersDto, isProtectedRoute: boolean): any {
    const whereConditions: any = {};

    if (filters.areaLow !== undefined || filters.areaHigh !== undefined) {
      whereConditions.area = {};
      if (filters.areaLow !== undefined) whereConditions.area.gte = filters.areaLow;
      if (filters.areaHigh !== undefined) whereConditions.area.lte = filters.areaHigh;
    }

    if (filters.subcategoryId || filters.categoryId) {
      whereConditions.subcategory = {};
      if (filters.subcategoryId) whereConditions.subcategory.id = filters.subcategoryId;
      if (filters.categoryId) whereConditions.subcategory.categoryId = filters.categoryId;
    }

    if (filters.listingTypeId) whereConditions.listingTypeId = filters.listingTypeId;

    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      const attributeConditions: any[] = [];
      for (const [attributeIdStr, valueIds] of Object.entries(filters.attributes)) {
        const attributeId = Number(attributeIdStr);
        const valueArray = Array.isArray(valueIds) ? valueIds.map((v) => Number(v)) : [Number(valueIds)];
        attributeConditions.push({
          productattributevalue: {
            some: { attributeId, attributeValueId: { in: valueArray } },
          },
        });
      }
      if (attributeConditions.length > 0) whereConditions.AND = attributeConditions;
    }

    if (filters.pricelow !== undefined || filters.pricehigh !== undefined) {
      whereConditions.price = {};
      if (filters.pricelow !== undefined) whereConditions.price.gte = filters.pricelow;
      if (filters.pricehigh !== undefined) whereConditions.price.lte = filters.pricehigh;
    }

    if (filters.cities || filters.country) {
      whereConditions.city = {};
      if (filters.cities && filters.cities.length > 0) {
        whereConditions.city.name = filters.cities.length === 1 ? filters.cities[0] : { in: filters.cities };
      }
      if (filters.country) whereConditions.city.country = { name: filters.country.toLowerCase() };
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    } else if (isProtectedRoute) {
      whereConditions.status = { in: ['active', 'draft', 'pending', 'sold', 'inactive'] };
    } else {
      whereConditions.status = 'active';
    }

    if (filters.userId) whereConditions.userId = filters.userId;
    if (filters.agencyId) whereConditions.agencyId = filters.agencyId;

    whereConditions.user = { status: { not: 'suspended' } };
    whereConditions.AND = [
      ...(whereConditions.AND || []),
      { OR: [{ agency: null }, { agency: { status: { not: 'suspended' } } }] },
    ];

    return whereConditions;
  }

  private buildOrderBy(filters: SearchFiltersDto): any[] {
    const orderBy: any[] = [];
    if (filters.sortBy && filters.sortBy !== 'most_clicks') {
      switch (filters.sortBy) {
        case 'price_asc':
          orderBy.push({ price: 'asc' });
          break;
        case 'price_desc':
          orderBy.push({ price: 'desc' });
          break;
        case 'date_asc':
          orderBy.push({ createdAt: 'asc' });
          break;
        case 'date_desc':
          orderBy.push({ createdAt: 'desc' });
          break;
      }
    } else {
      orderBy.push({ createdAt: 'desc' });
    }
    return orderBy;
  }
}