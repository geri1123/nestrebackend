import { Injectable } from '@nestjs/common';
import {type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
import { ProductAttributeValue } from '../../domain/entities/product-attribute-value.entity';

@Injectable()
export class GetAttributesByProductUseCase {
  constructor(
    private readonly productAttributeValueRepository: IProductAttributeValueRepository
  ) {}

  async execute(productId: number): Promise<ProductAttributeValue[]> {
    return this.productAttributeValueRepository.findByProductId(productId);
  }
}