// import { Module } from '@nestjs/common';
// import { ProductImageRepository } from './infrastructure/persistence/product-image.repository';
// import { PRODUCT_IMAGE_REPOSITORY_TOKEN } from './domain/repositories/product-image.repository.interface';
// import { UploadProductImagesUseCase } from './application/use-cases/upload-product-images.use-case';
// import { DeleteProductImagesUseCase } from './application/use-cases/delete-product-images.use-case';
// import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
// import { FirebaseModule } from '../../infrastructure/firebase/firebase.module';
// @Module({
// imports: [PrismaModule, FirebaseModule],
// providers: [
// {
// provide: PRODUCT_IMAGE_REPOSITORY_TOKEN,
// useClass: ProductImageRepository,
// },
// UploadProductImagesUseCase,
// DeleteProductImagesUseCase,
// ],
// exports: [UploadProductImagesUseCase, DeleteProductImagesUseCase, PRODUCT_IMAGE_REPOSITORY_TOKEN],
// })
// export class ProductImageModule {}