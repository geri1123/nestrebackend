import { Prisma, ProductAdvertisement, advertisement_type } from "@prisma/client";

export interface IProductAdvertisementRepository {
  
  createAdvertisementTx(
    tx: Prisma.TransactionClient,
    productId: number,
    userId: number,
    adType?: advertisement_type,
    startDate?: Date,
    endDate?: Date,
    walletTxId?: string
  ): Promise<ProductAdvertisement>;

 
  updateStatus(
    adId: number,
    status: "active" | "inactive" | "expired" | "pending"
  ): Promise<ProductAdvertisement>;


  getActiveAd(productId: number): Promise<ProductAdvertisement | null>;
  expireAds(now: Date): Promise<number> ;
}