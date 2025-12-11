import { advertisement_type } from "@prisma/client";
import { AdvertisementPricingEntity } from "../entities/advertisement-pricing.entity";
export const ADVERTISEMENT_PRICING_REPO = Symbol("ADVERTISEMENT_PRICING_REPO");
export interface UpdatePricingData {
  price?: number;
  duration?: number;
  discount?: number | null;
  isActive?: boolean;
}
export interface IAdvertisementPricingRepository {
  getPricing(adType: advertisement_type): Promise<AdvertisementPricingEntity | null>;
  getAll(): Promise<AdvertisementPricingEntity[]>;
update(
  adType: advertisement_type,
  data: UpdatePricingData
): Promise<AdvertisementPricingEntity>;
create(data: {
  adType: advertisement_type;
  price: number;
  duration: number;
  discount?: number;
  isActive?: boolean;
});
}