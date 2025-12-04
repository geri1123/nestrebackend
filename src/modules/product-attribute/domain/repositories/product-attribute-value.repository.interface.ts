import { ProductAttributeValueEntity } from '../entities/product-attribute-value.entity';

export interface IProductAttributeValueRepository {
  create(entity: ProductAttributeValueEntity): Promise<void>;
  createMultiple(entities: ProductAttributeValueEntity[]): Promise<void>;
  deleteByProductId(productId: number): Promise<number>;
}

export const PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN = Symbol('IProductAttributeValueRepository');