import { ProductImageEntity } from "../../../product/types/product.type";

export abstract class IProductImageRepository {
  abstract create(image: ProductImageEntity): Promise<ProductImageEntity>;

  abstract findById(id: number): Promise<ProductImageEntity | null>;

  abstract findByProductId(productId: number): Promise<ProductImageEntity[]>;

  abstract deleteByProductId(productId: number): Promise<number>;

  abstract bulkCreate(images: ProductImageEntity[]): Promise<ProductImageEntity[]>;
}
