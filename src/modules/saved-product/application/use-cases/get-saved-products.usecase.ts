import { Inject, Injectable } from '@nestjs/common';
import {type ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';

import { SupportedLang } from '../../../../locales';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { formatDate } from '../../../../common/utils/date';
import { PaginatedSavedProductsDto, SavedProductDto } from '../../dto/save-product.dto';

@Injectable()
export class GetSavedProductsUseCase {
  constructor(
    @Inject('ISavedProductRepository')
    private readonly repository: ISavedProductRepository,
    private readonly firebaseService: FirebaseService
  ) {}

  async execute(
    userId: number,
    language: SupportedLang,
    page: number = 1,
    limit: number = 12
  ): Promise<PaginatedSavedProductsDto> {
    const skip = (page - 1) * limit;

    const [count, savedProducts] = await Promise.all([
      this.repository.countByUser(userId),
      this.repository.findByUserPaginated(userId, language, skip, limit),
    ]);

    const products: SavedProductDto[] = savedProducts.map((saved: any) => {
      const images = saved.product.productimage.map((img: any) => ({
        imageUrl: img.imageUrl ? this.firebaseService.getPublicUrl(img.imageUrl) : null,
      }));

      return {
        id: saved.product.id,
        title: saved.product.title,
        price: saved.product.price,
        categoryName: saved.product.subcategory?.category?.categorytranslation?.[0]?.name || 'No Category',
        subcategoryName: saved.product.subcategory?.subcategorytranslation?.[0]?.name || 'No Subcategory',
        listingTypeName: saved.product.listing_type?.listing_type_translation?.[0]?.name || 'No Listing Type',
        city: saved.product.city?.name || 'No City',
        country: saved.product.city?.country?.name || 'No Country',
        user: { username: saved.product.user?.username || 'Unknown' },
        images,
        savedAt: formatDate(saved.saved_at ),
      };
    });

    return {
      products,
      count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }
}