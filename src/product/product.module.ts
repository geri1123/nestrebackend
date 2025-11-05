import { Module } from "@nestjs/common";
import { SearchProductsRepo } from "../repositories/product/search-product.repository";
import { SearchProductsService } from "./search-product.service";
import { SearchProductsController } from "./product.controller";
import { CreateProductsRepository } from "../repositories/product/create-product.repository";
import { CreateProductService } from "./create-product.service";
import { ProductAttributeValueService } from "./product-attribute-value.service";
import { ProductAttributeValueRepo } from "../repositories/product-attribute-value/product-attribute-value.repository";
import { CreateProductImageService } from "./create-product-images.service";
import { ProductImagesRepository } from "../repositories/productImage/product-image.repository";
import { FirebaseService } from "../firebase/firebase.service";
import { AttributeRepo } from "../repositories/attributes/attributes.repository";
import { UpdateProductService } from "./update-product.service";
@Module({
  controllers: [SearchProductsController],
  providers: [
    SearchProductsRepo,
    ProductAttributeValueRepo,
    ProductAttributeValueService,
    CreateProductsRepository,
    CreateProductService,
    SearchProductsService,
    CreateProductImageService, 
    ProductImagesRepository,   
    AttributeRepo,
    UpdateProductService
           
  ],
})
export class ProductModule {}