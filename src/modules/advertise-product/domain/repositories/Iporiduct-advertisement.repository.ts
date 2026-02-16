import { Prisma, ProductAdvertisement, AdvertisementType } from "@prisma/client";
import { Advertisement } from "../entities/advertisement.entity";
export const ADVERTISE_REPO = Symbol('ADVERTISE_REPO');
export interface IProductAdvertisementRepository {
  
  createAdvertisementTx(
    tx: Prisma.TransactionClient,
    productId: number,
    userId: number,
    adType?: AdvertisementType,
    startDate?: Date,
    endDate?: Date,
    walletTxId?: string
  ): Promise<Advertisement>;

  findExpiredAds(now: Date): Promise<Array<{ 
    id: number; 
    userId: number; 
    productId: number; 
  }>>;
  updateStatus(
    adId: number,
    status: "active" | "inactive" | "expired" | "pending"
  ): Promise<ProductAdvertisement>;



  getActiveAd(productId: number): Promise<ProductAdvertisement | null>;
  expireAds(now: Date): Promise<number> ;
}