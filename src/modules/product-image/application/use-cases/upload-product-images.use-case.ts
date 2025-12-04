import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PRODUCT_IMAGE_REPOSITORY_TOKEN,type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { ProductImageEntity } from '../../domain/entities/product-image.entity';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UploadProductImagesUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPOSITORY_TOKEN)
    private readonly imageRepo: IProductImageRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(
    files: Express.Multer.File[],
    productId: number,
    userId: number,
    language: SupportedLang
  ): Promise<{ id: number; imageUrl: string }[]> {
    if (!files || files.length === 0) {
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

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const filePath = await this.firebaseService.uploadFile(file, `products/${productId}`);
        const entity = ProductImageEntity.create({ imageUrl: filePath, productId, userId });
        const imageId = await this.imageRepo.create(entity);
        return { id: imageId, imageUrl: filePath };
      })
    );

    return uploadedImages;
  }
}
