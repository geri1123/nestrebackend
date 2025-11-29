import { Module } from "@nestjs/common";
import { SearchProductsRepo } from "../../repositories/product/search-product.repository";
import { SearchProductsService } from "./services/search-product.service";
import { SearchProductsController } from "./controller/product.controller";
import { ProductsRepository } from "../../repositories/product/product.repository";
import { CreateProductService } from "./services/create-product.service";
import { ProductAttributeValueService } from "./services/product-attribute-value.service";
import { ProductAttributeValueRepo } from "../../repositories/product-attribute-value/product-attribute-value.repository";
import { CreateProductImageService } from "./services/create-product-images.service";
import { ProductImagesRepository } from "../../repositories/productImage/product-image.repository";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
import { AttributeRepo } from "../../repositories/attributes/attributes.repository";
import { UpdateProductService } from "./services/update-product.service";
import { UserModule } from "../users/users.module";
import { AgentModule } from "../agent/agent.module";
import { ProductService } from "./services/product-service";
import { ManageProductController } from "./controller/manage-products.controller";
import { SearchFiltersHelper } from "./utils/search-filters.helper";
import { AgencyModule } from "../agency/agency.module";
import { ProductClicksModule } from "../product-clicks/product-clicks.module";
import { SoftAuthService } from "../../common/soft-auth/soft-auth.service";
import { JwtModule } from "@nestjs/jwt";
@Module({
  controllers: [SearchProductsController      , ManageProductController],
  imports:[UserModule ,ProductClicksModule,    JwtModule.register({}), AgentModule , AgencyModule ,ProductClicksModule],
  providers: [
   SoftAuthService,
    SearchProductsRepo,
    ProductAttributeValueRepo,
    ProductAttributeValueService,
    ProductsRepository,
    CreateProductService,
    SearchProductsService,
    CreateProductImageService, 
    ProductImagesRepository,   
    AttributeRepo,
    UpdateProductService,
    ProductService,
    SearchFiltersHelper  ,
    

  ],
  exports:[ProductService]
})
export class ProductModule {}