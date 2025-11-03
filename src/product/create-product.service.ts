import { Injectable } from "@nestjs/common";
import { CreateProductImageService } from "./create-product-images.service";
import { ProductAttributeValueService } from "./product-attribute-value.service";

@Injectable()
export class CreateProductService {
  constructor(
    private readonly createProductImageService: CreateProductImageService,
    private readonly productAttributeValueService: ProductAttributeValueService,
   
  ) {}
}