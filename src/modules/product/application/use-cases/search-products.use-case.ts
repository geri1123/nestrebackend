

import { Inject, Injectable } from '@nestjs/common';
import {
  SEARCH_PRODUCT_REPO,
  type ISearchProductRepository,
} from '../../domain/repositories/search-product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';

import { ProductListMapper } from '../mappers/product-list.mapper';
import { SearchFiltersResolver } from '../../infrastructure/search/search-filters-resolver.service';
import { ProductListResponseDto } from '../../dto/product-frontend/product-list.dto';

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
  ): Promise<ProductListResponseDto> {
    const resolvedFilters = await this.filtersResolver.resolve(filters);

    const [products, totalCount] = await Promise.all([
      this.searchProductRepository.searchProducts(
        resolvedFilters,
        language,
        isProtectedRoute
      ),
      this.searchProductRepository.getProductsCount(
        resolvedFilters,
        language,
        isProtectedRoute
      ),
    ]);

    return {
      products: ProductListMapper.toDtoArray(products),
      totalCount,
      currentPage: Math.floor(resolvedFilters.offset! / resolvedFilters.limit!) + 1,
      totalPages: Math.ceil(totalCount / resolvedFilters.limit!),
    };
  }
}