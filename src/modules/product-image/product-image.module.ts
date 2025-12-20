import { Module } from '@nestjs/common';

// Domain Repository (interface)
import { PRODUCT_IMAGE_REPO } from './domain/repositories/product-image.repository.interface';
// Infrastructure Repository (implementation)

import { ProductImageRepository } from './infrastructure/persistence/product-image.repository';


// Application Use Cases
import { UploadProductImagesUseCase } from './application/use-cases/upload-product-images.use-case';
import { DeleteProductImagesByProductIdUseCase } from './application/use-cases/delete-product-images.use-case';
import { GetImagesByProductUseCase } from './application/use-cases/get-images-by-product.use-case';

// External Services
import { CommonModule } from '../../common/common.module';
import { CloudinaryModule } from '../../infrastructure/cloudinary/cloudinary.module';

@Module({
  imports:[  CommonModule ,  CloudinaryModule],
  providers: [
    // Repository implementation bound to interface
    {
     provide:PRODUCT_IMAGE_REPO ,
      useClass: ProductImageRepository,
    },

    // Use Cases
    UploadProductImagesUseCase,
    DeleteProductImagesByProductIdUseCase,
    GetImagesByProductUseCase,

  ],
  exports: [
   PRODUCT_IMAGE_REPO,
    UploadProductImagesUseCase,
    DeleteProductImagesByProductIdUseCase,
    GetImagesByProductUseCase,
  ],
})
export class ProductImageModule {}