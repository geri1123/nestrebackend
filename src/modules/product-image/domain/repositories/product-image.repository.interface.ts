import { ProductImage } from '../entities/product-image.entity';
export const PRODUCT_IMAGE_REPO = Symbol("PRODUCT_IMAGE_REPO");


export interface IProductImageRepository {
  create(image: ProductImage): Promise<ProductImage>;
  findByProductId(productId: number): Promise<ProductImage[]>;
  deleteByUrls(urls: string[]): Promise<void>;
  deleteByProductId(productId: number): Promise<void>;
  delete(id: number): Promise<void>;
}