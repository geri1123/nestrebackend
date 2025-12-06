import { Inject, Injectable } from '@nestjs/common';
import {PRODUCT_ATTRIBUTE_VALUE_REPO, type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
@Injectable()
export class DeleteProductAttributeValuesUseCase {
  constructor(
      @Inject(PRODUCT_ATTRIBUTE_VALUE_REPO)
        private readonly productAttributeValueRepository: IProductAttributeValueRepository,
  ) {}

  async execute(productId: number): Promise<{ count: number }> {
    return this.productAttributeValueRepository.deleteByProductId(productId);
  }
}