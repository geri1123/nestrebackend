import { Inject, Injectable } from '@nestjs/common';
import {SAVED_PRODUCT_REPO, type ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';

import { SupportedLang } from '../../../../locales';
import { formatDate } from '../../../../common/utils/date';
import { PaginatedSavedProductsDto, SavedProductDto } from '../../dto/save-product.dto';

@Injectable()
export class GetSavedProductsUseCase {
  constructor(
    @Inject(SAVED_PRODUCT_REPO)
    private readonly repository: ISavedProductRepository,
  ) {}

 async execute(
  userId: number,
  language: SupportedLang,
  page: number = 1,
  limit: number = 12
): Promise<PaginatedSavedProductsDto> {
  const skip = (page - 1) * limit;

  try {
    const [count, savedProducts] = await Promise.all([
      this.repository.countByUser(userId),
      this.repository.findByUserPaginated(userId, language as any, skip, limit), 
    ]);

 const products: SavedProductDto[] = savedProducts.map((saved: any) => {
  const image = Array.isArray(saved.product?.productImage)
    ? saved.product.productImage.map((img: any) => ({
        imageUrl: img?.imageUrl ?? null,
      }))
    : [];

  const categoryName =
    saved.product?.subcategory?.category?.categoryTranslation?.[0]?.name ?? null;
  const subcategoryName =
    saved.product?.subcategory?.subcategoryTranslation?.[0]?.name ?? null;
  const listingTypeName =
    saved.product?.listingType?.listingTypeTranslation?.[0]?.name ?? null;

  const agency = saved.product?.agency
    ? {
        agencyName: saved.product.agency.agencyName ?? null,
        logo:       saved.product.agency.logo ?? null,
      }
    : null;

  // ── Advertisement ────────────────────────────────
  const hasActiveAd = Array.isArray(saved.product?.advertisements)
    && saved.product.advertisements.length > 0;

  const advertisement = hasActiveAd
    ? {
        id:     saved.product.advertisements[0].id,
        status: saved.product.advertisements[0].status,
      }
    : null;

  return {
    id:              saved.product?.id ?? 0,
    title:           saved.product?.title ?? '',
    price:           saved.product?.price ?? 0,
    categoryName,
    subcategoryName,
    listingTypeName,
    area:            saved.product?.area ?? null,
    createdAt:       saved.product?.createdAt,
    city:            saved.product?.city?.name ?? null,
    country:         saved.product?.city?.country?.name ?? null,
    user:            { username: saved.product?.user?.username ?? null },
    image,
    agency,
    savedAt:         saved.savedAt,

    userId:          saved.product?.userId ?? null,
    agencyId:        saved.product?.agencyId ?? null,
    isAdvertised:    hasActiveAd,
    advertisement,
    totalClicks:     saved.product?.clickCount ?? 0,
  };
});

    return {
      products,
      totalCount:count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error('Error fetching saved products:', error);
    throw error;
  }
}
}