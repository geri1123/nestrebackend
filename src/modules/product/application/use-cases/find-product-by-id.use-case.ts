import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY_TOKEN,type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductEntity } from '../../domain/entities/product.entity';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(productId: number, language: SupportedLang): Promise<ProductEntity> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException(t('productNotFound', language));
    }
    return product;
  }
}