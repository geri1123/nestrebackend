import { ProductImageEntity } from '../entities/product-image.entity';

export interface IProductImageRepository {
  create(entity: ProductImageEntity): Promise<number>;
  findById(id: number): Promise<ProductImageEntity | null>;
  findByProductId(productId: number): Promise<ProductImageEntity[]>;
  deleteByProductId(productId: number): Promise<void>;
}

export const PRODUCT_IMAGE_REPOSITORY_TOKEN = Symbol('IProductImageRepository');