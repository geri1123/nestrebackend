import { Inject, Injectable } from '@nestjs/common';
import {PRODUCT_IMAGE_REPO, type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { ProductImage } from '../../domain/entities/product-image.entity';

@Injectable()
export class GetImagesByProductUseCase {
  constructor(
     @Inject(PRODUCT_IMAGE_REPO)
    private readonly productImageRepository: IProductImageRepository) {}

  async execute(productId: number): Promise<ProductImage[]> {
    return this.productImageRepository.findByProductId(productId);
  }
}