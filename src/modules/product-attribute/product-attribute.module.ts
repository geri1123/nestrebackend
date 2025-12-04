import { Module } from '@nestjs/common';
import { ProductAttributeValueRepository } from './infrastructure/persistence/product-attribute-value.repository';
import { PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN } from './domain/repositories/product-attribute-value.repository.interface';
import { CreateProductAttributesUseCase } from './application/use-cases/create-product-attributes.use-case';
import { DeleteProductAttributesUseCase } from './application/use-cases/delete-product-attributes.use-case';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { FiltersModule } from '../filters/filters.module';
@Module({
imports: [PrismaModule, FiltersModule],
providers: [
{
provide: PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
useClass: ProductAttributeValueRepository,
},
CreateProductAttributesUseCase,
DeleteProductAttributesUseCase,
],
exports: [CreateProductAttributesUseCase, DeleteProductAttributesUseCase, PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN],
})
export class ProductAttributeModule {}