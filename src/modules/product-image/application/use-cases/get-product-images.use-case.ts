import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_IMAGE_REPO,
  type IProductImageRepository,
} from '../../domain/repositories/product-image.repository.interface';
import { ProductImage } from '../../domain/entities/product-image.entity';
 

@Injectable()
export class GetProductImagesUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPO)
    private readonly productImageRepository: IProductImageRepository,
  ) {}
 
  async byProductId(productId: number): Promise<ProductImage[]> {
    return this.productImageRepository.findByProductId(productId);
  }
 
  async byIds(ids: number[]): Promise<ProductImage[]> {
    return this.productImageRepository.findByIds(ids);
  }
}
 