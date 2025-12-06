import { ProductAttributeValue } from '../entities/product-attribute-value.entity';
import { SupportedLang } from '../../../../locales';

export interface IProductAttributeValueRepository {
  create(attributeValue: ProductAttributeValue): Promise<ProductAttributeValue>;
  createMultiple(
    productId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang
  ): Promise<void>;
  deleteByProductId(productId: number): Promise<{ count: number }>;
  findByProductId(productId: number): Promise<ProductAttributeValue[]>;
}
