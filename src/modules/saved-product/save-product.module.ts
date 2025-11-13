import { Module } from '@nestjs/common';
import { SaveProductService } from './save-product.service';
import { SaveProductController } from './saved-product.controller';
import { SaveProductRepository } from '../../repositories/saved-product/save-product.repository';


@Module({
  controllers:[SaveProductController], 
  providers: [
    SaveProductService,
    SaveProductRepository
  ],
  exports: [
  
  ],
})
export class SaveProductModule {}