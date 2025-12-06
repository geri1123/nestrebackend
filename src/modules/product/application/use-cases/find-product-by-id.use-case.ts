import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPO,type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class FindProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: number, language: SupportedLang) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException(t('productNotFound', language));
    }

    return product;
  }
}