import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { IAdvertisementPricingRepository, UpdatePricingData } from "../../domain/repositories/advertisement-pricing.repository.interface";
import { AdvertisementType, AdvertisementPricing } from "@prisma/client";
import { AdvertisementPricingEntity } from "../../domain/entities/advertisement-pricing.entity";

@Injectable()
export class AdvertisementPricingRepository implements IAdvertisementPricingRepository {

  constructor(private prisma: PrismaService) {}

  private toEntity(data: AdvertisementPricing): AdvertisementPricingEntity {
    return new AdvertisementPricingEntity(
      data.id,
      data.adType,
      data.price.toNumber(),
      data.duration,
      data.discount?.toNumber() ?? null,
      data.isActive,
      data.createdAt,
      data.updatedAt,
    );
  }

  async getPricing(adType: AdvertisementType): Promise<AdvertisementPricingEntity | null> {
    const data = await this.prisma.advertisementPricing.findUnique({
      where: { adType },
    });
    return data ? this.toEntity(data) : null;
  }

  async getAll(): Promise<AdvertisementPricingEntity[]> {
    const rows = await this.prisma.advertisementPricing.findMany();
    return rows.map(r => this.toEntity(r));
  }

  async update(adType: AdvertisementType, data: UpdatePricingData): Promise<AdvertisementPricingEntity> {
    const updated = await this.prisma.advertisementPricing.update({
      where: { adType },
      data,
    });
    return this.toEntity(updated);
  }

  async create(data: {
    adType: AdvertisementType;
    price: number;
    duration: number;
    discount?: number;
    isActive?: boolean;
  }): Promise<AdvertisementPricingEntity> {
    const created = await this.prisma.advertisementPricing.create({
      data: {
        adType: data.adType,
        price: data.price,
        duration: data.duration,
        discount: data.discount ?? null,
        isActive: data.isActive ?? true,
      },
    });
    return this.toEntity(created);
  }
}