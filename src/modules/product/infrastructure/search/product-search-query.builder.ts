import { Injectable } from '@nestjs/common';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class ProductSearchQueryBuilder {
  build(
    filters: SearchFiltersDto,
    _language: SupportedLang, 
    isProtectedRoute: boolean = false,
  ): any {
    const whereConditions: any = {};

    if (filters.areaLow !== undefined || filters.areaHigh !== undefined) {
      whereConditions.area = {};
      if (filters.areaLow !== undefined) whereConditions.area.gte = filters.areaLow;
      if (filters.areaHigh !== undefined) whereConditions.area.lte = filters.areaHigh;
    }

    //  Category / subcategory
    if (filters.subcategoryId || filters.categoryId) {
      whereConditions.subcategory = {};
      if (filters.subcategoryId) {
        whereConditions.subcategory.id = filters.subcategoryId;
      }
      if (filters.categoryId) {
        whereConditions.subcategory.categoryId = filters.categoryId;
      }
    }

    //  Listing type
    if (filters.listingTypeId) {
      whereConditions.listingTypeId = filters.listingTypeId;
    }

    //  Attributes
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
//build year
if (filters.buildYearMin !== undefined || filters.buildYearMax !== undefined) {
  whereConditions.buildYear = {};

  if (filters.buildYearMin !== undefined)
    whereConditions.buildYear.gte = filters.buildYearMin;

  if (filters.buildYearMax !== undefined)
    whereConditions.buildYear.lte = filters.buildYearMax;
}
    //  Price range
    if (filters.pricelow !== undefined || filters.pricehigh !== undefined) {
      whereConditions.price = {};
      if (filters.pricelow !== undefined) whereConditions.price.gte = filters.pricelow;
      if (filters.pricehigh !== undefined) whereConditions.price.lte = filters.pricehigh;
    }

    //  City & country
    if (filters.cities || filters.country) {
      whereConditions.city = whereConditions.city || {};

      if (filters.cities && filters.cities.length > 0) {
        const normalizedCities = filters.cities.map((c) => c.trim().toLowerCase());

        whereConditions.city.name =
          normalizedCities.length === 1
            ? normalizedCities[0]
            : { in: normalizedCities };
      }

      if (filters.country) {
        whereConditions.city.country = {
          name: filters.country.trim().toLowerCase(),
        };
      }
    }

    // Status
    if (filters.status) {
      whereConditions.status = filters.status;
    } else if (isProtectedRoute) {
      whereConditions.status = {
        in: ['active', 'draft', 'pending', 'sold', 'inactive'],
      };
    } else {
      whereConditions.status = 'active';
    }

    //  User / agency
    if (filters.userId) whereConditions.userId = filters.userId;
    if (filters.agencyId) whereConditions.agencyId = filters.agencyId;

    //  User not suspended
    whereConditions.user = {
      status: { not: 'suspended' },
    };

    //  Agency not suspended OR null
    whereConditions.AND = [
      ...(whereConditions.AND || []),
      {
        OR: [{ agency: null }, { agency: { status: { not: 'suspended' } } }],
      },
    ];

    return whereConditions;
  }
}