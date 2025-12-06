export class ProductAttributeValue {
  private constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly attributeId: number,
    public readonly attributeValueId: number
  ) {}

  static create(data: {
    id?: number;
    productId: number;
    attributeId: number;
    attributeValueId: number;
  }): ProductAttributeValue {
    return new ProductAttributeValue(
      data.id || 0,
      data.productId,
      data.attributeId,
      data.attributeValueId
    );
  }

  toResponse() {
    return {
      id: this.id,
      productId: this.productId,
      attributeId: this.attributeId,
      attributeValueId: this.attributeValueId
    };
  }
}