import { Module } from '@nestjs/common';
import { SaveProductController } from './controller/saved-product.controller';
import { SaveProductUseCase } from './application/use-cases/save-product.usecase';
import { UnsaveProductUseCase } from './application/use-cases/unsave-product.usecase';
import { GetSavedProductsUseCase } from './application/use-cases/get-saved-products.usecase';
import { SavedProductRepository } from './infrasctructure/persistence/save-product.repository';
import { ProductModule } from '../product/product.module';
import { SAVED_PRODUCT_REPO } from './domain/repositories/Isave-product.repository';
import { GetSavedProductIdsUseCase } from './application/use-cases/get-saved-product-ids.usecase';

@Module({
  imports:[ProductModule],
  controllers: [SaveProductController],
  providers: [
    SaveProductUseCase,
    UnsaveProductUseCase,
    GetSavedProductsUseCase,
    GetSavedProductIdsUseCase,
    {
       provide: SAVED_PRODUCT_REPO,
      useClass: SavedProductRepository,
    },
  ],
})
export class SaveProductModule {}