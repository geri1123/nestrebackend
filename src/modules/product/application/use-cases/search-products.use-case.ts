import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY_TOKEN,type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SearchFiltersDto } from '../../dto/product-filters.dto';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class SearchProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(
    filters: SearchFiltersDto,
    language: SupportedLang,
    isProtectedRoute: boolean
  ): Promise<{ products: any[]; totalCount: number }> {
    const [products, totalCount] = await Promise.all([
      this.productRepo.search(filters, language, isProtectedRoute),
      this.productRepo.count(filters, language, isProtectedRoute),
    ]);

    return { products, totalCount };
  }
}