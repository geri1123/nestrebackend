


import { Module } from '@nestjs/common';

// Controllers
import { SearchProductsController } from './controller/product.controller';
import { ManageProductController } from './controller/manage-products.controller';

// Domain Repositories (interfaces)
import { PRODUCT_REPO } from './domain/repositories/product.repository.interface';
import {  SEARCH_PRODUCT_REPO } from './domain/repositories/search-product.repository.interface';

// Infrastructure Repositories (implementations)
import { ProductRepository } from './infrastructure/persisetence/product.repository';
import { SearchProductRepository } from './infrastructure/persisetence/search-product.repository';
// Application Use Cases
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case';
import { GetProductForPermissionUseCase } from './application/use-cases/get-product-for-permission.use-case';
import { GetRelatedProductsUseCase } from './application/use-cases/get-related.use-case';
// Utilities
import { SearchFiltersHelper } from './application/helpers/search-filters.helper';
import { UsersModule } from '../users/users.module';
import { AgentModule } from '../agent/agent.module';
import { AgencyModule } from '../agency/agency.module';
import { ProductClicksModule } from '../product-clicks/product-clicks.module';
import { ProductImageModule } from '../product-image/product-image.module';

import { ProductAttributeValueModule } from '../product-attribute/product-attribute.module';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';

import { CommonModule } from '../../common/common.module';
import { SoftAuthModule } from '../../common/soft-auth/soft-auth.module';
import { GetMostClickedProductsUseCase } from './application/use-cases/get-most-clicked-products.use-case';
import { ProductSearchQueryBuilder } from './infrastructure/search/product-search-query.builder';
import { SearchFiltersResolver } from './infrastructure/search/search-filters-resolver.service';
import { ProductOwnershipGuard } from '../../infrastructure/auth/guard/product-ownership.guard';

@Module({
  controllers: [SearchProductsController, ManageProductController ],
  imports: [
    UsersModule,
    CommonModule,
    AgentModule,
    AgencyModule,
    ProductClicksModule,
SoftAuthModule,
    ProductImageModule,
    ProductAttributeValueModule,
  ],
  providers: [
    {
      provide: PRODUCT_REPO,
      useClass: ProductRepository,
    },
    {
      provide: SEARCH_PRODUCT_REPO,
      useClass: SearchProductRepository,
    },
    ProductSearchQueryBuilder,
    SearchFiltersResolver,
ProductOwnershipGuard,
    // Use Cases
    GetRelatedProductsUseCase,
    FindProductByIdUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductByIdUseCase,
    SearchProductsUseCase,
    GetProductForPermissionUseCase,
GetMostClickedProductsUseCase,
    // Utilities
    SearchFiltersHelper,
    // SoftAuthService,
  ],
  exports: [
    SEARCH_PRODUCT_REPO,
    PRODUCT_REPO,
    GetProductByIdUseCase,
    GetProductForPermissionUseCase,
    FindProductByIdUseCase,
  ],
})
export class ProductModule {}