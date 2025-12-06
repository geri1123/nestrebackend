import { ProductImage } from '../entities/product-image.entity';

export interface IProductImageRepository {
  create(image: ProductImage): Promise<ProductImage>;
  findByProductId(productId: number): Promise<ProductImage[]>;
  deleteByProductId(productId: number): Promise<void>;
  delete(id: number): Promise<void>;
}