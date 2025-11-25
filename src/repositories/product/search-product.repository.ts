// repositories/products/SearchProductRepo.ts
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";
import { SupportedLang } from "../../locales/index.js";
import { SearchFiltersDto } from "../../modules/product/dto/product-filters.dto.js";
import { Injectable } from "@nestjs/common";
import { IsearchProductRepository } from "./Isearch-product.repository.js";
@Injectable()
export class SearchProductsRepo implements IsearchProductRepository{
  constructor(private prisma: PrismaService) {}


  async searchProducts(
  filters: SearchFiltersDto,
  language: SupportedLang,
  isProtectedRoute: boolean = false
): Promise<any[]> {
  const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);
 const orderBy: any[] = [];

 
  // This will sort products with active ads first, then non-advertised products
  orderBy.push({
    advertisements: {
      _count: 'desc'
    }
  });

  
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "price_asc":
        orderBy.push({ price: "asc" });
        break;
      case "price_desc":
        orderBy.push({ price: "desc" });
        break;
      case "date_asc":
        orderBy.push({ createdAt: "asc" });
        break;
      case "date_desc":
        orderBy.push({ createdAt: "desc" });
        break;
    }
  } else {
    orderBy.push({ createdAt: "desc" });
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
      status: true,
      description: true,
      streetAddress: true,
      createdAt: true,
      updatedAt: true,
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
        orderBy: {
          endDate: 'desc' 
        },
        take: 1 
      }
    
    
    },
  });
}
async getProductsCount(
  filters: SearchFiltersDto,
  language: SupportedLang,
  isProtectedRoute: boolean = false
): Promise<number> {
  const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);
  return this.prisma.product.count({ where: whereConditions });
}


private buildWhereConditions(filters: SearchFiltersDto, language: SupportedLang ,isProtectedRoute: boolean = false) {
  const whereConditions: any = {};

  // Area filter
  if (filters.areaLow !== undefined || filters.areaHigh !== undefined) {
    whereConditions.area = {};
    if (filters.areaLow !== undefined) whereConditions.area.gte = filters.areaLow;
    if (filters.areaHigh !== undefined) whereConditions.area.lte = filters.areaHigh;
  }

  //  Category & Subcategory filter by ID
  if (filters.subcategoryId || filters.categoryId) {
    whereConditions.subcategory = {};

    if (filters.subcategoryId) {
      whereConditions.subcategory.id = filters.subcategoryId;
    }

    if (filters.categoryId) {
      whereConditions.subcategory.categoryId = filters.categoryId;
    }
  }

  //  Listing Type filter
  if (filters.listingTypeId) {
    whereConditions.listingTypeId = filters.listingTypeId;
  }

  // Attribute filter by IDs
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

  //  Price filter
  if (filters.pricelow !== undefined || filters.pricehigh !== undefined) {
    whereConditions.price = {};
    if (filters.pricelow !== undefined) whereConditions.price.gte = filters.pricelow;
    if (filters.pricehigh !== undefined) whereConditions.price.lte = filters.pricehigh;
  }

  //  City / Country filter
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



// // let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" }; 
    // if (filters.sortBy) {
    //   switch (filters.sortBy) {
    //     case "price_asc":
    //       orderBy = { price: "asc" };
    //       break;
    //     case "price_desc":
    //       orderBy = { price: "desc" };
    //       break;
    //     case "date_asc":
    //       orderBy = { createdAt: "asc" };
    //       break;
    //     case "date_desc":
    //       orderBy = { createdAt: "desc" };
    //       break;
    //   }
    // }


    //   async searchProducts(filters: SearchFiltersDto, language: SupportedLang,   isProtectedRoute: boolean = false):Promise<any[]>{
//     const whereConditions: any = this.buildWhereConditions(filters, language, isProtectedRoute);
// let orderBy: any[] = [];

//   orderBy.push({
//     productAdvertisement: {
//       some: {
//         status: 'active',
//         startDate: { lte: new Date() },
//         endDate: { gte: new Date() }
//       }
//     },
//     createdAt: 'desc' // fallback within this group
//   });

//   // 2pply user's selected sort
//   if (filters.sortBy) {
//     switch (filters.sortBy) {
//       case "price_asc":
//         orderBy.push({ price: "asc" });
//         break;
//       case "price_desc":
//         orderBy.push({ price: "desc" });
//         break;
//       case "date_asc":
//         orderBy.push({ createdAt: "asc" });
//         break;
//       case "date_desc":
//         orderBy.push({ createdAt: "desc" });
//         break;
//     }
//   } else {
//     orderBy.push({ createdAt: "desc" });
//   }

//     console.log("Repository whereConditions:", JSON.stringify(whereConditions, null, 2));
//     console.log("Repository language:", language);

//     return this.prisma.product.findMany({
//       where: whereConditions,
//       take: filters.limit,
//       skip: filters.offset,
//       orderBy,
//       select: {
//         id: true,
//         title: true,
//         price: true,
//         status:true,
//         description: true,
//         streetAddress: true,
//         createdAt: true,
//         updatedAt: true,
//         productimage: { take: 2, select: { imageUrl: true } },
//         city: { select: { name: true } },
//         subcategory: {
//           select: {
//             slug: true, 
//             subcategorytranslation: {
//               where: { language },
//               select: { name: true },
//               take: 1,
//             },
//             category: {
//               select: {
//                 slug: true, 
//                 categorytranslation: {
//                   where: { language },
//                   select: { name: true },
//                   take: 1,
//                 },
//               },
//             },
//           },
//         },
//         listing_type: {
//           select: {
//             slug: true, 
//             listing_type_translation: {
//               where: { language },
//               select: { name: true },
//               take: 1,
//             },
//           },
//         },
//         productattributevalue: {
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
//             attribute_values: {
//               select: {
//                 value_code: true, 
//                 attributeValueTranslations: {
//                   where: { language },
//                   select: { name: true },
//                   take: 1,
//                 },
//               },
//             },
//           },
//         },
//         user:{select:{username:true}},
//         agency: { select: { agency_name: true, logo: true } },
//       },
//     });
//   }