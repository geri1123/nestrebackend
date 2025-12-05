export class ProductImageEntity {
  constructor(
    public readonly id: number,
    public readonly imageUrl: string,
    public readonly productId: number,
    public readonly userId: number,
    public readonly createdAt?: Date,
  ) {}

  static create(imageUrl: string, productId: number, userId: number): ProductImageEntity {
    return new ProductImageEntity(0, imageUrl, productId, userId);
  }

  getPublicUrl(storageService: { getPublicUrl: (path: string) => string }): string {
    return storageService.getPublicUrl(this.imageUrl);
  }
}