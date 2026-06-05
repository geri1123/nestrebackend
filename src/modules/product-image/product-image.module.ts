import { Module } from '@nestjs/common';
 
// Domain
import { PRODUCT_IMAGE_REPO } from './domain/repositories/product-image.repository.interface';
 
// Infrastructure
import { ProductImageRepository } from './infrastructure/persistence/product-image.repository';
 
// Use Cases
import { GetProductImagesUseCase } from './application/use-cases/get-product-images.use-case';
import { DeleteProductImagesUseCase } from './application/use-cases/delete-product-images.use-case';
import { UploadProductImagesUseCase } from './application/use-cases/upload-product-images.use-case';
 
// External
import { CommonModule } from '../../common/common.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';
 
@Module({
  imports: [CommonModule, CloudinaryModule],
  providers: [
    {
      provide: PRODUCT_IMAGE_REPO,
      useClass: ProductImageRepository,
    },
    GetProductImagesUseCase,
    DeleteProductImagesUseCase,
    UploadProductImagesUseCase,
  ],
  exports: [
    PRODUCT_IMAGE_REPO,
    GetProductImagesUseCase,
    DeleteProductImagesUseCase,
    UploadProductImagesUseCase,
  ],
})
export class ProductImageModule {}
 