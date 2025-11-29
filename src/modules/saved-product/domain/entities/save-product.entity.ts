export class SavedProductEntity {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly userId: number,
    public readonly savedAt: Date
  ) {}

  static create(userId: number, productId: number): SavedProductEntity {
    return new SavedProductEntity(
      0, 
      productId,
      userId,
      new Date()
    );
  }

  isSavedBy(userId: number): boolean {
    return this.userId === userId;
  }
}