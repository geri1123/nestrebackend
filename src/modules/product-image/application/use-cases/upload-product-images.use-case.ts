import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {PRODUCT_IMAGE_REPO, type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { ProductImage } from '../../domain/entities/product-image.entity';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UploadProductImagesUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPO)
    private readonly productImageRepository: IProductImageRepository,
    private readonly firebaseService: FirebaseService
  ) {}

  async execute(
    files: Express.Multer.File[],
    productId: number,
    userId: number,
    language: SupportedLang = 'al'
  ): Promise<{ id: number; imageUrl: string }[]> {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException(t('noImage', language));
    }

    if (files.length > 7) {
      throw new BadRequestException(t('maxFiveImagesAllowed', language));
    }

    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException(t('invalidFileType', language));
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(t('imageTooLarge', language));
      }
    }

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const filePath = await this.firebaseService.uploadFile(file, `products/${productId}`);
          
          const imageEntity = ProductImage.create({
            productId,
            userId,
            imageUrl: filePath,
          });

          const imageRecord = await this.productImageRepository.create(imageEntity);

          if (!imageRecord.imageUrl) {
            throw new BadRequestException(t('imageUrlMissingAfterUpload', language));
          }

          return { id: imageRecord.id, imageUrl: imageRecord.imageUrl };
        })
      );

      return uploadedImages;
    } catch (error) {
      console.error('❌ Error uploading product images:', error);
      throw new BadRequestException(t('errorUploadingProductImages', language));
    }
  }
}