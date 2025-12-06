import { Module } from '@nestjs/common';

// Domain Repositories (interfaces)
import { IProductAttributeValueRepository } from './domain/repositories/product-attribute.repository.interface';
import { IAttributeRepository } from './domain/repositories/attribute.repository.interface';

// Infrastructure Repositories (implementations)
import { ProductAttributeValueRepository } from './infrastructure/persistence/product-attribute.repository';
import { AttributeRepo } from '../filters/repositories/attributes/attributes.repository';
// Application Use Cases

import { GetAttributesByProductUseCase } from './application/use-cases/get-attributes-by-product.use-case';
import { CreateProductAttributeValuesUseCase } from './application/use-cases/create-product-attributes.use-case';
import { DeleteProductAttributeValuesUseCase } from './application/use-cases/delete-product-attributes.use-case';

@Module({
  providers: [
    // Repository implementations bound to interfaces
    {
      provide: 'IProductAttributeValueRepository',
      useClass: ProductAttributeValueRepository,
    },
    {
      provide: 'IAttributeRepository',
      useClass: AttributeRepo,
    },

    // Use Cases
    CreateProductAttributeValuesUseCase,
    DeleteProductAttributeValuesUseCase,
    GetAttributesByProductUseCase,
  ],
  exports: [
    'IProductAttributeValueRepository',
    'IAttributeRepository',
    CreateProductAttributeValuesUseCase,
    DeleteProductAttributeValuesUseCase,
    GetAttributesByProductUseCase,
  ],
})
export class ProductAttributeValueModule {}