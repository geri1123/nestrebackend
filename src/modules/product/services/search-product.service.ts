// products/search-products.service.ts
import { Injectable } from '@nestjs/common';
import { SearchProductsRepo } from '../../../repositories/product/search-product.repository';
import { SearchFiltersDto } from '../dto/product-filters.dto';
import { SupportedLang } from '../../../locales/index';
import { FirebaseService } from '../../../infrastructure/firebase/firebase.service';
import { ProductFrontendDto } from '../dto/product-frontend.dto';
import { ProductImageDto } from '../dto/product-frontend.dto';
import { ProductImageEntity } from '../types/product.type';
import { userInfo } from 'os';
@Injectable()
export class SearchProductsService {
  constructor(
    private readonly repo: SearchProductsRepo,
    private readonly firebaseservice:FirebaseService
) {}

  async getProducts(filters: SearchFiltersDto, language: SupportedLang ,   isProtectedRoute: boolean = false):Promise<{ products: ProductFrontendDto[]; totalCount: number; currentPage: number; totalPages: number }> {
  const [products, totalCount] = await Promise.all([
  this.repo.searchProducts(filters, language, isProtectedRoute),
  this.repo.getProductsCount(filters, language, isProtectedRoute),
]);
    const productsForFrontend: ProductFrontendDto[] = products.map((product) => {
      const images: ProductImageDto[]  = product.productimage.map((img:ProductImageDto) => ({
        imageUrl: img.imageUrl ? this.firebaseservice.getPublicUrl(img.imageUrl) : null,
        
      }));

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        city: product.city?.name || 'Unknown',
       createdAt: product.createdAt.toISOString(),
        image: images,
        userId:product.userId,
       status:product.status,
        categoryName:
          product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
        subcategoryName:
          product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
        listingTypeName:
          product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
              user: { username: product.user?.username || 'Unknown' }, 
        agency: product.agency
          ? {
              agency_name: product.agency.agency_name || 'Unknown Agency',
              logo: product.agency.logo ? this.firebaseservice.getPublicUrl(product.agency.logo) : null,
          
            }
          : null,
      };
    });

    return {
      products: productsForFrontend,
      totalCount,
      currentPage: Math.floor(filters.offset! / filters.limit!) + 1,
      totalPages: Math.ceil(totalCount / filters.limit!),
    };
  }
}