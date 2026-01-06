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
    private readonly filtersResolver: SearchFiltersResolver,
    private readonly queryBuilder: ProductSearchQueryBuilder,
  ) {}

  async searchProducts(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false,
  ): Promise<any[]> {
    // 🔹 Resolve slugs/codes to IDs before building conditions
    await this.filtersResolver.resolve(filters);

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
    await this.filtersResolver.resolve(filters);

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
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
// import { ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
// import { SearchFiltersDto } from '../../dto/product-filters.dto';
// import { SupportedLang } from '../../../../locales';
// import { ProductClicksService } from '../../../product-clicks/product-clicks.service';

// @Injectable()
// export class SearchProductRepository implements ISearchProductRepository {
//   constructor(
//     private prisma: PrismaService,
//     private productClicksService: ProductClicksService
//   ) {}

//   // 🔹 Normalize slugs: lowercase, replace ë→e, ç→c
//   private normalizeSlug(value?: string | null): string | undefined {
//     if (!value) return undefined;
//     return value
//       .trim()
//       .toLowerCase()
//       .replace(/ë/g, 'e')
//       .replace(/ç/g, 'c');
//   }

//   async searchProducts(
//     filters: SearchFiltersDto,
//     language: SupportedLang,
//     isProtectedRoute: boolean = false
//   ): Promise<any[]> {
//     // Resolve slugs/codes to IDs before building conditions
//     await this.resolveSlugsToids(filters);

//     const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);
//     console.log('🔎 WHERE CONDITIONS:', JSON.stringify(whereConditions, null, 2));

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
//         agencyId: true,
//         productimage: { take: 2, select: { imageUrl: true } },
//         city: { select: { name: true } },
//         subcategory: {
//           select: {
//             slug: true,
//             subcategorytranslation: { where: { language }, select: { name: true }, take: 1 },
//             category: {
//               select: {
//                 slug: true,
//                 categorytranslation: { where: { language }, select: { name: true }, take: 1 },
//               },
//             },
//           },
//         },
//         listing_type: {
//           select: {
//             slug: true,
//             listing_type_translation: { where: { language }, select: { name: true }, take: 1 },
//           },
//         },
//         productattributevalue: {
//           select: {
//             attributes: {
//               select: {
//                 code: true,
//                 attributeTranslation: { where: { language }, select: { name: true }, take: 1 },
//               },
//             },
//             attribute_values: {
//               select: {
//                 value_code: true,
//                 attributeValueTranslations: { where: { language }, select: { name: true }, take: 1 },
//               },
//             },
//           },
//         },
//         user: { 
//           select: { 
//             username: true,
//             email: true,
//             first_name: true,
//             last_name: true,
//             phone: true,
//             role: true,
//             status: true,
//           } 
//         },
//         agency: { 
//           select: { 
//             agency_name: true, 
//             logo: true,
//             address: true,
//             status: true,
//             phone: true,
//             created_at: true,
//           } 
//         },
//         advertisements: {
//           where: {
//             status: 'active',
//             startDate: { lte: new Date() },
//             endDate: { gte: new Date() }
//           },
//           select: {
//             id: true,
//             startDate: true,
//             endDate: true,
//             status: true,
//             adType: true
//           },
//           orderBy: { endDate: 'desc' },
//           take: 1
//         }
//       },
//     });

//     console.log(' PRODUCTS FOUND BEFORE CLICK MERGE:', allProducts.length);

//     const productIds = allProducts.map(p => p.id);
//     const clicksMap = await this.productClicksService.getClicksForProducts(productIds);

//     const productsWithClicks = allProducts.map(p => ({
//       ...p,
//       clickCount: clicksMap.get(String(p.id)) || 0
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
//       filters.offset,
//       filters.offset! + filters.limit!
//     );

//     console.log(' PRODUCTS RETURNED (paginated):', paginatedProducts.length);

//     return paginatedProducts;
//   }

//   async getProductsCount(
//     filters: SearchFiltersDto,
//     language: SupportedLang,
//     isProtectedRoute: boolean = false
//   ): Promise<number> {
//     // Resolve slugs/codes to IDs before counting
//     await this.resolveSlugsToids(filters);
    
//     const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);
//     const count = await this.prisma.product.count({ where: whereConditions });
//     console.log(' TOTAL COUNT FOR FILTERS:', count);
//     return count;
//   }

//   /**
//    * Resolve slugs and attribute codes to IDs
//    * This mutates the filters object.
//    */
//   private async resolveSlugsToids(filters: SearchFiltersDto): Promise<void> {
//     const normalizedCategory = this.normalizeSlug(filters.category);
//     const normalizedSubcategory = this.normalizeSlug(filters.subcategory);
//     const normalizedListingType = this.normalizeSlug(filters.listingtype);

//     console.log(' RESOLVING SLUGS:', {
//       original: {
//         category: filters.category,
//         subcategory: filters.subcategory,
//         listingtype: filters.listingtype
//       },
//       normalized: {
//         category: normalizedCategory,
//         subcategory: normalizedSubcategory,
//         listingtype: normalizedListingType
//       }
//     });

//     if (normalizedCategory && !filters.categoryId) {
//       try {
//         const category = await this.prisma.category.findUnique({
//           where: { slug: normalizedCategory },
//         });
        
//         if (!category) {
//           console.warn(` Category slug "${normalizedCategory}" not found in database`);
//         } else {
//           console.log(` Category found: ${category.slug} (ID: ${category.id})`);
//         }
        
//         filters.categoryId = category?.id || undefined;
//       } catch (error) {
//         console.error(' Error finding category:', error);
//         throw error;
//       }
//     }

//     //  SUBCATEGORY – canonical slug only
//     if (normalizedSubcategory && !filters.subcategoryId) {
//       try {
//         const subcategory = await this.prisma.subcategory.findUnique({
//           where: { slug: normalizedSubcategory },
//         });
        
//         if (!subcategory) {
//           console.warn(` Subcategory slug "${normalizedSubcategory}" not found in database`);
//         } else {
//           console.log(` Subcategory found: ${subcategory.slug} (ID: ${subcategory.id})`);
//         }
        
//         filters.subcategoryId = subcategory?.id || undefined;

//         // Auto-bind parent category
//         if (!filters.categoryId && subcategory?.categoryId) {
//           filters.categoryId = subcategory.categoryId;
//           console.log(` Auto-bound parent categoryId: ${subcategory.categoryId}`);
//         }
//       } catch (error) {
//         console.error(' Error finding subcategory:', error);
//         throw error;
//       }
//     }

//     //  LISTING TYPE – canonical slug only
//     if (normalizedListingType && !filters.listingTypeId) {
//       try {
//         const listingType = await this.prisma.listing_type.findFirst({
//           where: { slug: normalizedListingType },
//         });
        
//         if (!listingType) {
//           console.warn(`Listing type slug "${normalizedListingType}" not found in database`);
//         } else {
//           console.log(` Listing type found: ${listingType.slug} (ID: ${listingType.id})`);
//         }
        
//         filters.listingTypeId = listingType?.id || undefined;
//       } catch (error) {
//         console.error('Error finding listing type:', error);
//         throw error;
//       }
//     }

//     if (filters.attributeCodes && Object.keys(filters.attributeCodes).length > 0) {
//       const resolvedAttributes: Record<number, number[]> = filters.attributes || {};

//       for (const [attributeCode, valueCodes] of Object.entries(filters.attributeCodes)) {
//         try {
//           // Normalize attribute code
//           const normalizedAttrCode = this.normalizeSlug(attributeCode);
//           if (!normalizedAttrCode) {
//             console.warn(` Empty attribute code after normalization: "${attributeCode}"`);
//             continue;
//           }

//           console.log(`Looking for attribute code: "${normalizedAttrCode}"`);

//           // Find attribute by code
//           const attribute = await this.prisma.attribute.findFirst({
//             where: { 
//               code: normalizedAttrCode,
//               // Optionally filter by subcategory if available
//               ...(filters.subcategoryId && { subcategoryId: filters.subcategoryId })
//             }
//           });

//           if (!attribute) {
//             console.warn(` Attribute code "${attributeCode}" not found${filters.subcategoryId ? ` for subcategoryId ${filters.subcategoryId}` : ''}`);
//             continue;
//           }

//           console.log(` Attribute found: ${attribute.code} (ID: ${attribute.id})`);

//           // Split and normalize value codes
//           const valueCodeArray = valueCodes
//             .split(',')
//             .map(v => this.normalizeSlug(v.trim()))
//             .filter((code): code is string => code !== undefined);

//           if (valueCodeArray.length === 0) {
//             console.warn(` No valid value codes for attribute "${attributeCode}"`);
//             continue;
//           }

//           console.log(` Looking for value codes: [${valueCodeArray.join(', ')}]`);

//           // Find attribute values by code
//           const attributeValues = await this.prisma.attribute_value.findMany({
//             where: {
//               attribute_id: attribute.id,
//               value_code: { in: valueCodeArray }
//             },
//             select: { id: true, value_code: true }
//           });

//           if (attributeValues.length > 0) {
//             const valueIds = attributeValues.map(av => av.id);
//             resolvedAttributes[attribute.id] = [
//               ...(resolvedAttributes[attribute.id] || []),
//               ...valueIds
//             ];
//             console.log(`Found ${attributeValues.length} values: ${attributeValues.map(av => av.value_code).join(', ')}`);
//           } else {
//             console.warn(` No values found for attribute "${attributeCode}" with codes: ${valueCodeArray.join(', ')}`);
//           }
//         } catch (error) {
//           console.error(` Error resolving attribute "${attributeCode}":`, error);
//           // Continue with other attributes instead of failing completely
//         }
//       }

//       filters.attributes = resolvedAttributes;
//     }

//     console.log(' RESOLVED IDs:', {
//       category: filters.category,
//       subcategory: filters.subcategory,
//       listingtype: filters.listingtype,
//       categoryId: filters.categoryId,
//       subcategoryId: filters.subcategoryId,
//       listingTypeId: filters.listingTypeId,
//       attributeCodes: filters.attributeCodes,
//       attributes: filters.attributes,
//     });
//   }

//   private buildWhereConditions(
//     filters: SearchFiltersDto,
//     language: SupportedLang,
//     isProtectedRoute: boolean = false
//   ) {
//     const whereConditions: any = {};

//     if (filters.areaLow !== undefined || filters.areaHigh !== undefined) {
//       whereConditions.area = {};
//       if (filters.areaLow !== undefined) whereConditions.area.gte = filters.areaLow;
//       if (filters.areaHigh !== undefined) whereConditions.area.lte = filters.areaHigh;
//     }

//     if (filters.subcategoryId || filters.categoryId) {
//       whereConditions.subcategory = {};
//       if (filters.subcategoryId) {
//         whereConditions.subcategory.id = filters.subcategoryId;
//       }
//       if (filters.categoryId) {
//         whereConditions.subcategory.categoryId = filters.categoryId;
//       }
//     }

//     if (filters.listingTypeId) {
//       whereConditions.listingTypeId = filters.listingTypeId;
//     }

//     if (filters.attributes && Object.keys(filters.attributes).length > 0) {
//       const attributeConditions: any[] = [];
//       for (const [attributeIdStr, valueIds] of Object.entries(filters.attributes)) {
//         const attributeId = Number(attributeIdStr);
//         const valueArray = Array.isArray(valueIds)
//           ? valueIds.map((v) => Number(v))
//           : [Number(valueIds)];

//         attributeConditions.push({
//           productattributevalue: {
//             some: {
//               attributeId,
//               attributeValueId: { in: valueArray },
//             },
//           },
//         });
//       }

//       if (attributeConditions.length > 0) {
//         whereConditions.AND = attributeConditions;
//       }
//     }

//     if (filters.pricelow !== undefined || filters.pricehigh !== undefined) {
//       whereConditions.price = {};
//       if (filters.pricelow !== undefined) whereConditions.price.gte = filters.pricelow;
//       if (filters.pricehigh !== undefined) whereConditions.price.lte = filters.pricehigh;
//     }

// if (filters.cities || filters.country) {
//   whereConditions.city = whereConditions.city || {};

//   if (filters.cities && filters.cities.length > 0) {
//     const normalizedCities = filters.cities.map(c =>
//       c.trim().toLowerCase()
//     );

//     whereConditions.city.name =
//       normalizedCities.length === 1
//         ? normalizedCities[0]
//         : { in: normalizedCities };
//   }

//   if (filters.country) {
//     whereConditions.city.country = {
//       name: filters.country.trim().toLowerCase(),
//     };
//   }
// }

//     if (filters.status) {
//       whereConditions.status = filters.status;
//     } else if (isProtectedRoute) {
//       whereConditions.status = { in: ['active', 'draft', 'pending', 'sold', 'inactive'] };
//     } else {
//       whereConditions.status = 'active';
//     }

//     if (filters.userId) whereConditions.userId = filters.userId;
//     if (filters.agencyId) whereConditions.agencyId = filters.agencyId;

//     whereConditions.user = {
//       status: { not: 'suspended' },
//     };

//     whereConditions.AND = [
//       ...(whereConditions.AND || []),
//       {
//         OR: [
//           { agency: null },
//           { agency: { status: { not: 'suspended' } } },
//         ],
//       },
//     ];

//     return whereConditions;
//   }
// }