export class ProductImage {
  private constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly userId: number,
    public readonly imageUrl: string
  ) {}

  static create(data: {
    id?: number;
    productId: number;
    userId: number;
    imageUrl: string;
  }): ProductImage {
    return new ProductImage(
      data.id || 0,
      data.productId,
      data.userId,
      data.imageUrl
    );
  }

  toResponse() {
    return {
      id: this.id,
      productId: this.productId,
      userId: this.userId,
      imageUrl: this.imageUrl
    };
  }
}
