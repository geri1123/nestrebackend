// products/search-products.service.ts
import { Injectable } from '@nestjs/common';
import { SearchProductsRepo } from '../repositories/product/search-product.repository';
import { SearchFiltersDto } from './dto/product-filters.dto';
import { SupportedLang } from '../locales/index';
import { FirebaseService } from '../firebase/firebase.service';
import { ProductFrontendDto } from './dto/product-frontend.dto';

@Injectable()
export class SearchProductsService {
  constructor(
    private readonly repo: SearchProductsRepo,
    private readonly firebaseservice:FirebaseService
) {}

  async getProducts(filters: SearchFiltersDto, language: SupportedLang):Promise<{ products: ProductFrontendDto[]; totalCount: number; currentPage: number; totalPages: number }> {
    const products = await this.repo.searchProducts(filters, language);
    const totalCount = await this.repo.getProductsCount(filters, language);

    const productsForFrontend: ProductFrontendDto[] = products.map((product) => {
      const images = product.productimage.map((img) => ({
        imageUrl: img.imageUrl ? this.firebaseservice.getPublicUrl(img.imageUrl) : null,
        
      }));

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        city: product.city?.name || 'Unknown',
       createdAt: product.createdAt.toISOString(),
        image: images,
        categoryName:
          product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
        subcategoryName:
          product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
        listingTypeName:
          product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
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