import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductAttributeValueService } from './product-attribute-value.service';
import { SupportedLang, t } from '../../locales';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductsRepository } from '../../repositories/product/create-product.repository';
import { CreateProductImageService } from './create-product-images.service';
import { FirebaseService } from '../../infrastructure/firebase/firebase.service';

@Injectable()
export class UpdateProductService {
  constructor(
    private readonly createProductRepo: CreateProductsRepository,
    private readonly productAttributeValueService: ProductAttributeValueService,
    private readonly productImageService: CreateProductImageService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async updateProduct(
    productId: number,
    dto: UpdateProductDto,
    userId: number,
      agencyId?: number,
    language: SupportedLang = 'al',
    images?: Express.Multer.File[],
  ) {
    // 1️⃣ Fetch product
    const product = await this.createProductRepo.findProductById(productId);
    if (!product) {
      throw new NotFoundException({
        success: false,
        message: t('productNotFound', language),
        errors: { general: t('productNotFound', language) },
      });
    }

    // 2️⃣ Update product fields
    const updatedProduct = await this.createProductRepo.updateProductFields(productId, dto);

    // 3️⃣ Update product attributes
    if (dto.attributes?.length) {
      await this.productAttributeValueService.deleteAttributes(productId);
      await this.productAttributeValueService.createPrAttValues(
        productId,
       product.subcategoryId,
        dto.attributes,
        language,
      );
    }

    // 4️⃣ Handle images
    let imagesResponse: { id: number; imageUrl: string }[] = [];
    if (images?.length) {
      await this.productImageService.deleteImagesByProductId(productId);
      const uploadedImages = await this.productImageService.uploadProductImages(
        images,
        productId,
        userId,
        language,
      );

      imagesResponse = uploadedImages.images
        .map(img => ({
          id: img.id,
          imageUrl: this.firebaseService.getPublicUrl(img.imageUrl),
        }))
        .filter(img => img.imageUrl !== null) as { id: number; imageUrl: string }[];
    }

    return {
      success: true,
      message: t('productUpdated', language),
      product: {
        ...updatedProduct,
        images: imagesResponse,
      },
    };
  }
}
