// import { Module } from "@nestjs/common";
// import { SearchProductsRepo } from "../../repositories/product/search-product.repository";
// import { SearchProductsService } from "./services/search-product.service";
// import { SearchProductsController } from "./controller/product.controller";
// import { ProductsRepository } from "../../repositories/product/product.repository";
// import { CreateProductService } from "./services/create-product.service";
// import { ProductAttributeValueService } from "./services/product-attribute-value.service";
// import { ProductAttributeValueRepo } from "../../repositories/product-attribute-value/product-attribute-value.repository";
// import { CreateProductImageService } from "./services/create-product-images.service";
// import { ProductImagesRepository } from "../../repositories/productImage/product-image.repository";
// import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
// import { AttributeRepo } from "../filters/repositories/attributes/attributes.repository";
// import { UpdateProductService } from "./services/update-product.service";
// import { UsersModule } from "../users/users.module";
// import { AgentModule } from "../agent/agent.module";
// import { ProductService } from "./services/product-service";
// import { ManageProductController } from "./controller/manage-products.controller";
// import { SearchFiltersHelper } from "./utils/search-filters.helper";
// import { AgencyModule } from "../agency/agency.module";
// import { ProductClicksModule } from "../product-clicks/product-clicks.module";
// import { SoftAuthService } from "../../common/soft-auth/soft-auth.service";
// import { JwtModule } from "@nestjs/jwt";
// @Module({
//   controllers: [SearchProductsController      , ManageProductController],
//   imports:[UsersModule ,ProductClicksModule,    JwtModule.register({}), AgentModule , AgencyModule ,ProductClicksModule],
//   providers: [
//    SoftAuthService,
//     SearchProductsRepo,
//     ProductAttributeValueRepo,
//     ProductAttributeValueService,
//     ProductsRepository,
//     CreateProductService,
//     SearchProductsService,
//     CreateProductImageService, 
//     ProductImagesRepository,   
//     AttributeRepo,
//     UpdateProductService,
//     ProductService,
//     SearchFiltersHelper  ,
    

//   ],
//   exports:[ProductService]
// })
// export class ProductModule {}



import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Controllers
import { SearchProductsController } from './controller/product.controller';
import { ManageProductController } from './controller/manage-products.controller';

// Domain Repositories (interfaces)
import { IProductRepository } from './domain/repositories/product.repository.interface';
import { ISearchProductRepository } from './domain/repositories/search-product.repository.interface';

// Infrastructure Repositories (implementations)
import { ProductRepository } from './infrastructure/persisetence/product.repository';
import { SearchProductRepository } from './infrastructure/persisetence/search-product.repository';
// Application Use Cases
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case';
import { GetProductForPermissionUseCase } from './application/use-cases/get-product-for-permission.use-case';

// Utilities
import { SearchFiltersHelper } from './utils/search-filters.helper';

// External Modules
import { UsersModule } from '../users/users.module';
import { AgentModule } from '../agent/agent.module';
import { AgencyModule } from '../agency/agency.module';
import { ProductClicksModule } from '../product-clicks/product-clicks.module';
import { ProductImageModule } from '../product-image/product-image.module';

import { SoftAuthService } from '../../common/soft-auth/soft-auth.service';
import { ProductAttributeValueModule } from '../product-attribute/product-attribute.module';

@Module({
  controllers: [SearchProductsController, ManageProductController],
  imports: [
    UsersModule,
    AgentModule,
    AgencyModule,
    ProductClicksModule,
    ProductImageModule,
    ProductAttributeValueModule,
    JwtModule.register({}),
  ],
  providers: [
    // Repository implementations bound to interfaces
    {
      provide: 'IProductRepository',
      useClass: ProductRepository,
    },
    {
      provide: 'ISearchProductRepository',
      useClass: SearchProductRepository,
    },

    // Use Cases
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductByIdUseCase,
    SearchProductsUseCase,
    GetProductForPermissionUseCase,

    // Utilities
    SearchFiltersHelper,
    SoftAuthService,
  ],
  exports: [
    'IProductRepository',
    'ISearchProductRepository',
    GetProductByIdUseCase,
    GetProductForPermissionUseCase,
  ],
})
export class ProductModule {}