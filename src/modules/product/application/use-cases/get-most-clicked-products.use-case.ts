import { Injectable, Inject } from '@nestjs/common';
import { SEARCH_PRODUCT_REPO,type ISearchProductRepository } from '../../domain/repositories/search-product.repository.interface';
import { SupportedLang } from '../../../../locales';
import { ProductFrontendDto } from '../../dto/product-frontend.dto';
import { ProductFrontendMapper } from '../mappers/product-frontend.mapper';
import { SearchFiltersDto } from '../../dto/product-filters.dto';

@Injectable()
export class GetMostClickedProductsUseCase {
  constructor(
    @Inject(SEARCH_PRODUCT_REPO)
    private readonly searchProductRepository: ISearchProductRepository,
  ) {}

  async execute(
    limit: number,
    language: SupportedLang,
  ): Promise<ProductFrontendDto[]> {
    const filters: SearchFiltersDto = {
      sortBy: 'most_clicks',
      limit,
      offset: 0,
      status: 'active'
    };

    const products = await this.searchProductRepository.searchProducts(
      filters,
      language,
      false
    );

    return products.map(ProductFrontendMapper.toDto);
  }
}