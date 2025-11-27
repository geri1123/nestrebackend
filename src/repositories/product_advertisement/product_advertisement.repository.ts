import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { Prisma, ProductAdvertisement, advertisement_type } from "@prisma/client";
import { IProductAdvertisementRepository } from "./Iporiduct_advertisement.repository";
import { Advertisement } from "../../modules/advertise_product/domain/advertisement.entity";

@Injectable()
export class ProductAdvertisementRepository implements IProductAdvertisementRepository {
  constructor(private readonly prisma: PrismaService) {}
  // async createAdvertisementTx(
  //   tx: Prisma.TransactionClient, 
  //   productId: number,
  //   userId: number,
  //   adType: advertisement_type = "normal",
  //   startDate?: Date,
  //   endDate?: Date,
  //     walletTxId?: string
  // ): Promise<ProductAdvertisement> {
  //   return tx.productAdvertisement.create({
  //     data: {
  //       productId,
  //       userId,
  //       adType,
  //       startDate: startDate || new Date(),
  //       endDate,
  //       status: "active",
  //        walletTxId,
  //     },
  //   });
  
  // }
  async createAdvertisementTx(
  tx: Prisma.TransactionClient, 
  productId: number,
  userId: number,
  adType: advertisement_type = "normal",
  startDate?: Date,
  endDate?: Date,
  walletTxId?: string
): Promise<Advertisement> { 
  const ad = await tx.productAdvertisement.create({
    data: {
      productId,
      userId,
      adType,
      startDate: startDate || new Date(),
      endDate,
      status: "active",
      walletTxId,
    },
  });

  // Map Prisma model to domain entity
  return new Advertisement(
    ad.id,
    ad.productId,
    ad.userId,
    ad.adType,
    ad.startDate,
    ad.endDate,
    ad.walletTxId
  );
}
  async updateStatus(adId: number, status: "active" | "inactive" | "expired" | "pending") {
    return this.prisma.productAdvertisement.update({
      where: { id: adId },
      data: { status },
    });
  }
async getActiveAd(productId: number) {
  return this.prisma.productAdvertisement.findFirst({
    where: {
      productId,
      status: "active",
      endDate: {
        gt: new Date(),
      },
    },
  });
}
 async expireAds(now: Date): Promise<number> {
  const result = await this.prisma.productAdvertisement.updateMany({
    where: {
      status: 'active',
      endDate: { lte: now }, 
    },
    data: { status: 'expired' },
  });
  return result.count;
}
}