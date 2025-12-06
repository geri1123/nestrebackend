import { Injectable } from '@nestjs/common';
import {type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
@Injectable()
export class DeleteProductAttributeValuesUseCase {
  constructor(
    private readonly productAttributeValueRepository: IProductAttributeValueRepository
  ) {}

  async execute(productId: number): Promise<{ count: number }> {
    return this.productAttributeValueRepository.deleteByProductId(productId);
  }
}