import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { SupportedLang, t } from '../../../../locales';
import { DeleteProductImagesByProductIdUseCase } from '../../../product-image/application/use-cases/delete-product-images.use-case';
import { UploadProductImagesUseCase } from '../../../product-image/application/use-cases/upload-product-images.use-case';
import { DeleteProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/delete-product-attributes.use-case';
import { CreateProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/create-product-attributes.use-case';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';

@Injectable()
export class UpdateProductUseCase {
  constructor(
     @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly deleteImagesUseCase: DeleteProductImagesByProductIdUseCase,
    private readonly uploadImagesUseCase: UploadProductImagesUseCase,
    private readonly deleteAttributesUseCase: DeleteProductAttributeValuesUseCase,
    private readonly createAttributesUseCase: CreateProductAttributeValuesUseCase,
    private readonly firebaseService: FirebaseService
  ) {}

  async execute(
    productId: number,
    dto: UpdateProductDto,
    userId: number,
    agencyId: number | undefined,
    language: SupportedLang,
    images?: Express.Multer.File[]
  ) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException({
        success: false,
        message: t('productNotFound', language),
        errors: { general: t('productNotFound', language) },
      });
    }

    const updateData = Product.createForUpdate({
      id: productId,
      title: dto.title,
      price: dto.price,
      description: dto.description,
      streetAddress: dto.address,
      area: dto.area,
      buildYear: dto.buildYear,
      status: dto.status,
    });

    const updatedProduct = await this.productRepository.update(productId, updateData);

    if (dto.attributes?.length) {
      await this.deleteAttributesUseCase.execute(productId);
      await this.createAttributesUseCase.execute(
        productId,
        product.subcategoryId,
        dto.attributes,
        language
      );
    }

    let imagesResponse: { id: number; imageUrl: string }[] = [];
    if (images?.length) {
      await this.deleteImagesUseCase.execute(productId);
      const uploadedImages = await this.uploadImagesUseCase.execute(
        images,
        productId,
        userId,
        language
      );

      imagesResponse = uploadedImages
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
        ...updatedProduct.toResponse(),
        images: imagesResponse,
      },
    };
  }
}