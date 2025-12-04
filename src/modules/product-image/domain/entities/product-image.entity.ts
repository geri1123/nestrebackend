export class ProductImageEntity {
  constructor(
    public readonly id: number | null,
    public readonly imageUrl: string | null,
    public readonly productId: number,
    public readonly userId: number,
  ) {}

  static create(data: { imageUrl: string; productId: number; userId: number }): ProductImageEntity {
    return new ProductImageEntity(null, data.imageUrl, data.productId, data.userId);
  }
}
