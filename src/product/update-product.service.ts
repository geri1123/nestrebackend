import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProductAttributeValueService } from './product-attribute-value.service';
import { SupportedLang, t } from '../locales';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductsRepository } from '../repositories/product/create-product.repository';
import { error } from 'console';
import { CreateProductImageService } from './create-product-images.service';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UpdateProductService {
  constructor(
    private readonly createProductRepo: CreateProductsRepository,
    private readonly productAttributeValueService: ProductAttributeValueService,
    private readonly priductImageService:CreateProductImageService,
    private readonly firebaseService:FirebaseService
  ) {}


 async updateProduct(
  productId: number,
  dto: UpdateProductDto,
  userId: number,
  language: SupportedLang = 'al',
  images?: Express.Multer.File[], // accept new images if provided
) {
  // 1️⃣ Find existing product
  const product = await this.createProductRepo.findProductById(productId);

  if (!product) {
    throw new NotFoundException({
      success: false,
      message: t('productNotFound', language),
      errors: { general: t('productNotFound', language) },
    });
  }

  if (product.userId !== userId) {
    throw new ForbiddenException({
      success: false,
      message: t('forbiddenProduct', language),
      errors: { general: t('forbiddenProduct', language) },
    });
  }

  // 2️⃣ Update product fields
  const updatedProduct = await this.createProductRepo.updateProductFields(productId, dto);

  // 3️⃣ Update product attributes
  if (dto.attributes && dto.attributes.length > 0) {
    await this.productAttributeValueService.deleteAttributes(productId);
    await this.productAttributeValueService.createPrAttValues(
      productId,
      product.subcategoryId,
      dto.attributes,
      language,
    );
  }

let imagesResponse: { id: number; imageUrl: string }[] = [];

if (images && images.length > 0) {
  // Delete old images
  await this.priductImageService.deleteImagesByProductId(productId);

  // Upload new images
  const uploadedImages = await this.priductImageService.uploadProductImages(
    images,
    productId,
    userId,
    language,
  );

//   imagesResponse = uploadedImages.images;
imagesResponse = uploadedImages.images
  .map(img => ({
    id: img.id,
    imageUrl: this.firebaseService.getPublicUrl(img.imageUrl),
  }))
  .filter(img => img.imageUrl !== null) as { id: number; imageUrl: string }[];
}

// When returning, combine product with images
return {
  success: true,
  message: t('productUpdated', language),
  product: {
    ...updatedProduct,   
    images: imagesResponse, 
  },
};

}}