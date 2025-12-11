import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IAdvertisementPricingRepository, UpdatePricingData } from "../../domain/repositories/advertisement-pricing.repository.interface";
import { advertisement_type } from "@prisma/client";
import { AdvertisementPricingEntity } from "../../domain/entities/advertisement-pricing.entity";

@Injectable()
export class AdvertisementPricingRepository implements IAdvertisementPricingRepository {

  constructor(private prisma: PrismaService) {}

  async getPricing(adType: advertisement_type) {
    const data = await this.prisma.advertisementPricing.findUnique({
      where: { adType },
    });
    if (!data) return null;
    return new AdvertisementPricingEntity(
      data.id,
      data.adType,
      data.price,
      data.duration,
      data.discount,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  async getAll() {
    const rows = await this.prisma.advertisementPricing.findMany();
    return rows.map(r => new AdvertisementPricingEntity(
      r.id, r.adType, r.price, r.duration, r.discount,
      r.isActive, r.createdAt, r.updatedAt
    ));
  }

  async update(
  adType: advertisement_type,
  data: UpdatePricingData
): Promise<AdvertisementPricingEntity>{
    const updated = await this.prisma.advertisementPricing.update({
      where: { adType },
      data,
    });

    return new AdvertisementPricingEntity(
      updated.id,
      updated.adType,
      updated.price,
      updated.duration,
      updated.discount,
      updated.isActive,
      updated.createdAt,
      updated.updatedAt
    );
  }
  async create(data: {
  adType: advertisement_type;
  price: number;
  duration: number;
  discount?: number;
  isActive?: boolean;
}) {
  const created = await this.prisma.advertisementPricing.create({
    data: {
      adType: data.adType,
      price: data.price,
      duration: data.duration,
      discount: data.discount ?? null,
      isActive: data.isActive ?? true,
    },
  });

  return new AdvertisementPricingEntity(
    created.id,
    created.adType,
    created.price,
    created.duration,
    created.discount,
    created.isActive,
    created.createdAt,
    created.updatedAt
  );
}
}