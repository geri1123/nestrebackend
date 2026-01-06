import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service.js';
import { LanguageCode, product_status } from '@prisma/client';
import { IListingTypeRepository } from './Ilistingtype.repository.js';
import { ListingTypeDto } from '../../dto/filters.dto.js';

@Injectable()
export class ListingTypeRepo implements IListingTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllListingTypes(
    language: LanguageCode = LanguageCode.al,
    status?: product_status,
  ): Promise<ListingTypeDto[]> {
    const listingTypes = await this.prisma.listing_type.findMany({
      select: {
        id: true,
        slug: true,  // ✅ Add canonical slug from listing_type table
        listing_type_translation: {
          where: { language },
          select: { 
            name: true
            // ❌ Remove slug from here
          },
        },
        _count: {
          select: {
            product: status ? { where: { status } } : true,
          },
        },
      },
    });

    return listingTypes.map((lt) => {
      const translation = lt.listing_type_translation[0];
      return {
        id: lt.id,
        name: translation?.name ?? '',
        slug: lt.slug,  // ✅ Use canonical slug from listing_type table
        productCount: lt._count.product ?? 0,
      };
    });
  }
}