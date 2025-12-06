import { Injectable } from '@nestjs/common';
import {type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { ProductImage } from '../../domain/entities/product-image.entity';

@Injectable()
export class GetImagesByProductUseCase {
  constructor(private readonly productImageRepository: IProductImageRepository) {}

  async execute(productId: number): Promise<ProductImage[]> {
    return this.productImageRepository.findByProductId(productId);
  }
}