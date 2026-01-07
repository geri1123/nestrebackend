// import { Inject, Injectable } from '@nestjs/common';
// import {
//   SEARCH_PRODUCT_REPO,
//   type ISearchProductRepository,
// } from '../../domain/repositories/search-product.repository.interface';
// import { SearchFiltersDto } from '../../dto/product-filters.dto';
// import { SupportedLang } from '../../../../locales';
// import { ProductFrontendDto } from '../../dto/product-frontend.dto';
// import { ProductFrontendMapper } from '../mappers/product-frontend.mapper';

// @Injectable()
// export class SearchProductsUseCase {
//   constructor(
//     @Inject(SEARCH_PRODUCT_REPO)
//     private readonly searchProductRepository: ISearchProductRepository,
//   ) {}

//   async execute(
//     filters: SearchFiltersDto,
//     language: SupportedLang,
//     isProtectedRoute = false,
//   ): Promise<{
//     products: ProductFrontendDto[];
//     totalCount: number;
//     currentPage: number;
//     totalPages: number;
//   }> {
//     const [products, totalCount] = await Promise.all([
//       this.searchProductRepository.searchProducts(filters, language, isProtectedRoute),
//       this.searchProductRepository.getProductsCount(filters, language, isProtectedRoute),
//     ]);

//     return {
//       products: products.map(ProductFrontendMapper.toDto),
//       totalCount,
//       currentPage: Math.floor(filters.offset! / filters.limit!) + 1,
//       totalPages: Math.ceil(totalCount / filters.limit!),
//     };
//   }
// }


import { Inject, Injectable } from '@nestjs/common';
import {
  SEARCH_PRODUCT_REPO,
 type ISearchProductRepository,
} from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';
import { ProductFrontendDto } from '../../dto/product-frontend.dto';
import { ProductFrontendMapper } from '../mappers/product-frontend.mapper';
import { SearchFiltersResolver } from '../../infrastructure/search/search-filters-resolver.service';
@Injectable()
export class SearchProductsUseCase {
  constructor(
    @Inject(SEARCH_PRODUCT_REPO)
    private readonly searchProductRepository: ISearchProductRepository,
    private readonly filtersResolver: SearchFiltersResolver,
  ) {}

  async execute(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute = false,
  ): Promise<{
    products: ProductFrontendDto[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const resolvedFilters = await this.filtersResolver.resolve(filters);

    const [products, totalCount] = await Promise.all([
      this.searchProductRepository.searchProducts(resolvedFilters, language, isProtectedRoute),
      this.searchProductRepository.getProductsCount(resolvedFilters, language, isProtectedRoute),
    ]);

    return {
      products: products.map(ProductFrontendMapper.toDto),
      totalCount,
      currentPage: Math.floor(resolvedFilters.offset! / resolvedFilters.limit!) + 1,
      totalPages: Math.ceil(totalCount / resolvedFilters.limit!),
    };
  }
}