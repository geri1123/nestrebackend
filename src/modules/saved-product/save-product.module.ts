import { Module } from '@nestjs/common';
import { SaveProductController } from './saved-product.controller';
import { SaveProductUseCase } from './use-cases/save-product.usecase';
import { UnsaveProductUseCase } from './use-cases/unsave-product.usecase';
import { GetSavedProductsUseCase } from './use-cases/get-saved-products.usecase';
import { SavedProductRepository } from '../../repositories/saved-product/save-product.repository';
import { FirebaseModule } from '../../infrastructure/firebase/firebase.module';

@Module({
  imports:[FirebaseModule],
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