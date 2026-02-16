import { ProductAttributeValue } from '../entities/product-attribute-value.entity';
export const PRODUCT_ATTRIBUTE_VALUE_REPO = Symbol('PRODUCT_ATTRIBUTE_VALUE_REPO');

export interface IProductAttributeValueRepository {
  create(attributeValue: ProductAttributeValue): Promise<ProductAttributeValue>;
  createMultiple(
    productId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    
  ): Promise<void>;
  deleteByProductId(productId: number): Promise<{ count: number }>;
  findByProductId(productId: number): Promise<ProductAttributeValue[]>;
}
