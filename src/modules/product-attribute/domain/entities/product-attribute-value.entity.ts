export class ProductAttributeValueEntity {
  constructor(
    public readonly id: number | null,
    public readonly productId: number,
    public readonly attributeId: number,
    public readonly attributeValueId: number,
  ) {}

  static create(data: { productId: number; attributeId: number; attributeValueId: number }): ProductAttributeValueEntity {
    return new ProductAttributeValueEntity(null, data.productId, data.attributeId, data.attributeValueId);
  }
}