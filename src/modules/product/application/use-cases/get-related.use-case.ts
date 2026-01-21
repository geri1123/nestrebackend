import { Inject, Injectable } from '@nestjs/common';
import { SEARCH_PRODUCT_REPO, type ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
import { SupportedLang } from '../../../../locales';
import { ProductFrontendDto } from '../../dto/product-frontend.dto';
import { ProductFrontendMapper } from '../mappers/product-frontend.mapper';
import { SearchFiltersDto } from '../../dto/product-filters.dto';

@Injectable()
export class GetRelatedProductsUseCase {
  constructor(
    @Inject(SEARCH_PRODUCT_REPO)
    private readonly searchProductRepository: ISearchProductRepository,
  ) {}

  async execute(
    productId: number,
    subcategoryId: number,
    categoryId: number,
    language: SupportedLang,
    limit: number = 6,
  ): Promise<ProductFrontendDto[]> {
    const filters: SearchFiltersDto = {
      subcategoryId, 
      limit,
      offset: 0,
      status: 'active',
    };

    let products = await this.searchProductRepository.searchProducts(
      filters,
      language,
      false,
    );

    products = products.filter((p) => p.id !== productId);

    if (products.length < limit) {
      const categoryFilters: SearchFiltersDto = {
        categoryId,
        limit: limit - products.length,
        offset: 0,
        status: 'active',
      };

      const categoryProducts = await this.searchProductRepository.searchProducts(
        categoryFilters,
        language,
        false,
      );

      const existingIds = new Set(products.map((p) => p.id));
      const additionalProducts = categoryProducts.filter(
        (p) => p.id !== productId && !existingIds.has(p.id),
      );

      products = [...products, ...additionalProducts];
    }

    products = products.slice(0, limit);

    return products.map(ProductFrontendMapper.toDto);
  }
}