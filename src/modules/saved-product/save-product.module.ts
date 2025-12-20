import { Module } from '@nestjs/common';
import { SaveProductController } from './controller/saved-product.controller';
import { SaveProductUseCase } from './application/use-cases/save-product.usecase';
import { UnsaveProductUseCase } from './application/use-cases/unsave-product.usecase';
import { GetSavedProductsUseCase } from './application/use-cases/get-saved-products.usecase';
import { SavedProductRepository } from './infrasctructure/persistence/save-product.repository';

@Module({
  imports:[],
  controllers: [SaveProductController],
  providers: [
    SaveProductUseCase,
    UnsaveProductUseCase,
    GetSavedProductsUseCase,
    {
      provide: 'ISavedProductRepository',
      useClass: SavedProductRepository,
    },
  ],
})
export class SaveProductModule {}