import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { LanguageCode, ProductStatus } from '@prisma/client';
import { IListingTypeRepository } from './Ilistingtype.repository';

@Injectable()
export class ListingTypeRepo implements IListingTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Get structure WITHOUT counts (for caching)
  async getAllListingTypes(language: LanguageCode = LanguageCode.al): Promise<any[]> {
    return this.prisma.listingType.findMany({
      select: {
        id: true,
        slug: true,
        listingTypeTranslation: {
          where: { language },
          select: {
            name: true,
          },
        },
       
      },
    });
  }

  // Get ONLY counts (fresh, not cached)
  async getListingTypeCounts(
    status: ProductStatus = ProductStatus.active,
  ): Promise<Record<number, number>> {
    const listingTypes = await this.prisma.listingType.findMany({
      select: {
        id: true,
        _count: {
          select: {
            product: {
              where: { status },
            },
          },
        },
      },
    });

    const countMap: Record<number, number> = {};
    listingTypes.forEach((lt) => {
      countMap[lt.id] = lt._count.product;
    });

    return countMap;
  }
}