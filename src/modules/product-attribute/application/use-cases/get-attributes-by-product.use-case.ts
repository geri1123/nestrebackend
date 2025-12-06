import { Inject, Injectable } from '@nestjs/common';
import {PRODUCT_ATTRIBUTE_VALUE_REPO, type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
import { ProductAttributeValue } from '../../domain/entities/product-attribute-value.entity';

@Injectable()
export class GetAttributesByProductUseCase {
  constructor(
     @Inject(PRODUCT_ATTRIBUTE_VALUE_REPO)
       private readonly productAttributeValueRepository: IProductAttributeValueRepository,
  ) {}

  async execute(productId: number): Promise<ProductAttributeValue[]> {
    return this.productAttributeValueRepository.findByProductId(productId);
  }
}