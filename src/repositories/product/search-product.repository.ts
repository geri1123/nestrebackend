// repositories/products/SearchProductRepo.ts
import { SupportedLang } from "../../locales/index.js";
import { SearchFiltersDto } from "../../product/dto/product-filters.dto.js";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
@Injectable()
export class SearchProductsRepo {
  constructor(private prisma: PrismaService) {}

  async searchProducts(filters: SearchFiltersDto, language: SupportedLang) {
    const whereConditions: any = this.buildWhereConditions(filters, language);

    let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" }; 
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "date_asc":
          orderBy = { createdAt: "asc" };
          break;
        case "date_desc":
          orderBy = { createdAt: "desc" };
          break;
      }
    }

    console.log("Repository whereConditions:", JSON.stringify(whereConditions, null, 2));
    console.log("Repository language:", language);

    return this.prisma.product.findMany({
      where: whereConditions,
      take: filters.limit,
      skip: filters.offset,
      orderBy,
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        streetAddress: true,
        createdAt: true,
        updatedAt: true,
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
         productattributevalue: {  // Changed from attribute_values
    select: {
      attributes: {  // Changed from attribute
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
        agency: { select: { agency_name: true, logo: true } },
      },
    });
  }

  async getProductsCount(filters: SearchFiltersDto, language: SupportedLang): Promise<number> {
    const whereConditions: any = this.buildWhereConditions(filters, language);
    return this.prisma.product.count({ where: whereConditions });
  }

  private buildWhereConditions(filters: SearchFiltersDto, language: SupportedLang) {
    const whereConditions: any = {};

    if (filters.areaLow !== undefined || filters.areaHigh !== undefined) {
      whereConditions.area = {}; 
      if (filters.areaLow !== undefined) whereConditions.area.gte = filters.areaLow;
      if (filters.areaHigh !== undefined) whereConditions.area.lte = filters.areaHigh;
    }

    if (filters.categorySlug || filters.subcategorySlug) {
      whereConditions.subcategory = {};
      
    

    if (filters.categorySlug) {
      whereConditions.subcategory.category = {
        categorytranslation: {
          some: { language, slug: filters.categorySlug },
        },
      };
    }

    if (filters.subcategorySlug) {
      whereConditions.subcategory.subcategorytranslation = {
        some: { language, slug: filters.subcategorySlug },
      };
    
  }

    }

    if (filters.listingtype) {
      whereConditions.listingType = {
        listing_type_translation: {
          some: {
            language,
            slug: filters.listingtype,
          },
        },
      };
    }

    if (filters.attributes && Object.keys(filters.attributes).length > 0) {
      const attributeConditions: any[] = [];

      for (const [attributeSlug, valueSlug] of Object.entries(filters.attributes)) {
        const valuesArray = Array.isArray(valueSlug) ? valueSlug : [valueSlug];

        attributeConditions.push({
          attributes: {
            some: {
              attribute: {
                attributeTranslation: {
                  some: { 
                    language, 
                    slug: attributeSlug
                  },
                },
              },
              attributeValue: {
                attributeValueTranslations: {
                  some: { 
                    language, 
                    slug: { in: valuesArray } 
                  },
                },
              },
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

    // City and Country filters - MySQL compatible
    if (filters.cities || filters.country) {
      whereConditions.city = {};
      
      if (filters.cities && filters.cities.length > 0) {
        // Use 'in' for multiple cities
        whereConditions.city.name = filters.cities.length === 1 
          ? filters.cities[0] 
          : { in: filters.cities };
      }
      
      if (filters.country) {
        whereConditions.city.country = {
          name: filters.country.toLowerCase()
        };
      }
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    return whereConditions;
  }
}