import { ProductClickEntity } from '../entities/product-click.entity';

export abstract class IProductClickRepository {
  abstract create(click: ProductClickEntity): Promise<ProductClickEntity>;

  abstract incrementClick(
    productId: string,
    userId: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<ProductClickEntity>;

  abstract findByProductId(productId: string): Promise<ProductClickEntity[]>;

  abstract getClicksForProducts(productIds: string[]): Promise<Map<string, number>>;
}