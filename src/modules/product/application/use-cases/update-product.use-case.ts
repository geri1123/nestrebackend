import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPO,type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { SupportedLang, t } from '../../../../locales';
import { DeleteProductImagesByProductIdUseCase } from '../../../product-image/application/use-cases/delete-product-images.use-case';
import { UploadProductImagesUseCase } from '../../../product-image/application/use-cases/upload-product-images.use-case';
import { DeleteProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/delete-product-attributes.use-case';
import { CreateProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/create-product-attributes.use-case';

interface UpdateProductParams {
  productId: number;
  dto: UpdateProductDto;
  userId: number;
  language: SupportedLang;
  images?: Express.Multer.File[];
}

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly deleteImagesUseCase: DeleteProductImagesByProductIdUseCase,
    private readonly uploadImagesUseCase: UploadProductImagesUseCase,
    private readonly deleteAttributesUseCase: DeleteProductAttributeValuesUseCase,
    private readonly createAttributesUseCase: CreateProductAttributeValuesUseCase,
  ) {}

  async execute({
    productId,
    dto,
    userId,
    language,
    images,
  }: UpdateProductParams) {
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

    // 🔹 Attributes
    if (Array.isArray(dto.attributes) && dto.attributes.length > 0) {
      await this.deleteAttributesUseCase.execute(productId);
      await this.createAttributesUseCase.execute(
        productId,
        product.subcategoryId,
        dto.attributes,
        language,
      );
    }

    //  Images
    let imagesResponse: { id: number; imageUrl: string }[] = [];

    if (Array.isArray(images) && images.length > 0) {
      await this.deleteImagesUseCase.execute(productId);

      const uploadedImages =
        (await this.uploadImagesUseCase.execute(
          images,
          productId,
          userId,
          language,
        )) ?? [];

      imagesResponse = uploadedImages
        .filter(img => img?.imageUrl)
        .map(img => ({
          id: img.id,
          imageUrl: img.imageUrl!,
        }));
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