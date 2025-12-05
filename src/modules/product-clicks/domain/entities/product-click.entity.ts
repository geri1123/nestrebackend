export class ProductClickEntity {
  constructor(
    public readonly productId: string,
    public readonly userId: string,
    public readonly ipAddress: string,
    public count: number,
    public readonly userAgent?: string,
    public readonly createdAt?: Date,
  ) {}

  static create(
    productId: string,
    userId: string,
    ipAddress: string,
    userAgent?: string,
  ): ProductClickEntity {
    return new ProductClickEntity(productId, userId, ipAddress, 1, userAgent);
  }

  incrementCount(): void {
    this.count += 1;
  }
}