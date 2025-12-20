import { Inject, Injectable } from '@nestjs/common';
import {type ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';

import { SupportedLang } from '../../../../locales';
import { formatDate } from '../../../../common/utils/date';
import { PaginatedSavedProductsDto, SavedProductDto } from '../../dto/save-product.dto';

@Injectable()
export class GetSavedProductsUseCase {
  constructor(
    @Inject('ISavedProductRepository')
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
      this.repository.findByUserPaginated(userId, language as any, skip, limit), // Cast if needed
    ]);

    const products: SavedProductDto[] = savedProducts.map((saved: any) => {
      // Safely handle images
      const images = Array.isArray(saved.product?.productimage) 
        ? saved.product.productimage.map((img: any) => ({
            imageUrl: img?.imageUrl ?? null,
          }))
        : [];

      // Safely get translation names
      const categoryTranslations = saved.product?.subcategory?.category?.categorytranslation;
      const categoryName = Array.isArray(categoryTranslations) && categoryTranslations.length > 0
        ? categoryTranslations[0].name
        : 'No Category';

      const subcategoryTranslations = saved.product?.subcategory?.subcategorytranslation;
      const subcategoryName = Array.isArray(subcategoryTranslations) && subcategoryTranslations.length > 0
        ? subcategoryTranslations[0].name
        : 'No Subcategory';

      const listingTypeTranslations = saved.product?.listing_type?.listing_type_translation;
      const listingTypeName = Array.isArray(listingTypeTranslations) && listingTypeTranslations.length > 0
        ? listingTypeTranslations[0].name
        : 'No Listing Type';

      return {
        id: saved.product?.id ?? 0,
        title: saved.product?.title ?? '',
        price: saved.product?.price ?? 0,
        categoryName,
        subcategoryName,
        listingTypeName,
        city: saved.product?.city?.name ?? 'No City',
        country: saved.product?.city?.country?.name ?? 'No Country',
        user: { username: saved.product?.user?.username ?? 'Unknown' },
        images,
        savedAt: formatDate(saved.saved_at),
      };
    });

    return {
      products,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error('Error fetching saved products:', error);
    throw error;
  }
}
}