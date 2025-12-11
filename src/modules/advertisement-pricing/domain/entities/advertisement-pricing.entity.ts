export class AdvertisementPricingEntity {
  constructor(
    public id: number,
    public adType: string,
    public price: number,
    public duration: number,
    public discount: number | null,
    public isActive: boolean,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}