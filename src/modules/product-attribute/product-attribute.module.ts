import { Module } from '@nestjs/common';

// Domain Repositories (interfaces)
import {  PRODUCT_ATTRIBUTE_VALUE_REPO } from './domain/repositories/product-attribute.repository.interface';

// Infrastructure Repositories (implementations)
import { ProductAttributeValueRepository } from './infrastructure/persistence/product-attribute.repository';
import { AttributeRepo } from '../filters/repositories/attributes/attributes.repository';
// Application Use Cases

import { GetAttributesByProductUseCase } from './application/use-cases/get-attributes-by-product.use-case';
import { CreateProductAttributeValuesUseCase } from './application/use-cases/create-product-attributes.use-case';
import { DeleteProductAttributeValuesUseCase } from './application/use-cases/delete-product-attributes.use-case';
import { FiltersModule } from '../filters/filters.module';

@Module({
    imports:[
FiltersModule,
    ],
  providers: [
    {
      provide: PRODUCT_ATTRIBUTE_VALUE_REPO,
      useClass: ProductAttributeValueRepository,
    },

    // Use Cases
    
    CreateProductAttributeValuesUseCase,
    DeleteProductAttributeValuesUseCase,
    GetAttributesByProductUseCase,
  ],
  exports: [
PRODUCT_ATTRIBUTE_VALUE_REPO,   
    CreateProductAttributeValuesUseCase,
    DeleteProductAttributeValuesUseCase,
    GetAttributesByProductUseCase,
  ],
})
export class ProductAttributeValueModule {}