import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { ProductAdvertisement, advertisement_type } from "@prisma/client";

@Injectable()
export class ProductAdvertisementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAdvertisement(
    productId: number,
    userId: number,
    adType: advertisement_type = "normal",
    startDate?: Date,
    endDate?: Date
  ): Promise<ProductAdvertisement> {
    return this.prisma.productAdvertisement.create({
      data: {
        productId,
        userId,
        adType,
        startDate: startDate || new Date(),
        endDate,
        status: "active",
      },
    });
  }

  async updateStatus(adId: number, status: "active" | "inactive" | "expired" | "pending") {
    return this.prisma.productAdvertisement.update({
      where: { id: adId },
      data: { status },
    });
  }
  async hasActiveAdvertisement(productId: number): Promise<boolean> {
    const activeAd = await this.prisma.productAdvertisement.findFirst({
      where: {
        productId,
        status: "active",
        OR: [
          { endDate: null }, // No end date means indefinite
          { endDate: { gte: new Date() } }, // End date is in the future
        ],
      },
    });

    return !!activeAd;
  }

}