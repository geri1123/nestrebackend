import { Injectable, BadRequestException } from '@nestjs/common';
import {type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../dto/create-product.dto';
import { SupportedLang, t } from '../../../../locales';
import { UploadProductImagesUseCase } from '../../../product-image/application/use-cases/upload-product-images.use-case';
import { CreateProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/create-product-attributes.use-case';
@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly uploadImagesUseCase: UploadProductImagesUseCase,
    private readonly createAttributeValuesUseCase: CreateProductAttributeValuesUseCase
  ) {}

  async execute(
    dto: CreateProductDto,
    images: Express.Multer.File[],
    language: SupportedLang,
    userId: number,
    agencyId?: number
  ) {
    try {
      const productEntity = Product.create({
        title: dto.title,
        price: dto.price,
        cityId: dto.cityId,
        subcategoryId: dto.subcategoryId,
        listingTypeId: dto.listingTypeId,
        description: dto.description || '',
        streetAddress: dto.address || '',
        area: dto.area ? Number(dto.area) : undefined,
        buildYear: dto.buildYear ? Number(dto.buildYear) : undefined,
        status: dto.status || 'draft',
        userId,
        agencyId,
      });

      const createdProduct = await this.productRepository.create(productEntity);

      const tasks: Promise<any>[] = [];

      tasks.push(
        images?.length
          ? this.uploadImagesUseCase.execute(images, createdProduct.id, userId, language)
          : Promise.resolve([])
      );

      tasks.push(
        dto.attributes?.length
          ? this.createAttributeValuesUseCase.execute(
              createdProduct.id,
              dto.subcategoryId,
              dto.attributes,
              language
            )
          : Promise.resolve(undefined)
      );

      const [uploadedImages] = await Promise.all(tasks);

      return {
        success: true,
        message: t('successadded', language),
        product: {
          ...createdProduct.toResponse(),
          images: uploadedImages,
        },
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new BadRequestException({
        success: false,
        message: t('failedCreatingProduct', language),
        errors: error?.errors || { general: [t('failedCreatingProduct', language)] },
      });
    }
  }
}