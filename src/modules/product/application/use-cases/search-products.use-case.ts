import { Inject, Injectable } from '@nestjs/common';
import {SEARCH_PRODUCT_REPO, type ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
import { ProductFrontendDto, ProductImageDto } from '../../dto/product-frontend.dto';

@Injectable()
export class SearchProductsUseCase {
  constructor(
     @Inject(SEARCH_PRODUCT_REPO)
    private readonly searchProductRepository: ISearchProductRepository,
  ) {}

  async execute(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean = false
  ): Promise<{ products: ProductFrontendDto[]; totalCount: number; currentPage: number; totalPages: number }> {
    const [products, totalCount] = await Promise.all([
      this.searchProductRepository.searchProducts(filters, language, isProtectedRoute),
      this.searchProductRepository.getProductsCount(filters, language, isProtectedRoute),
    ]);

    const productsForFrontend: ProductFrontendDto[] = products.map((product) => {
      const images: ProductImageDto[] = product.productimage.map((img: ProductImageDto) => ({
        imageUrl: img.imageUrl ? img.imageUrl : null,
      }));

      const hasActiveAd = product.advertisements && product.advertisements.length > 0;

      const advertisement = hasActiveAd
        ? {
            id: product.advertisements[0].id,
            status: product.advertisements[0].status,
          }
        : null;

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        city: product.city?.name || 'Unknown',
        createdAt: product.createdAt.toISOString(),
        image: images,
        userId: product.userId,
        status: product.status,
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
              logo: product.agency.logo ? product.agency.logo : null,
            }
          : null,
        isAdvertised: hasActiveAd,
        advertisement,
        totalClicks: product.clickCount,
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