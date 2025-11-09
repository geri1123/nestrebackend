import { Injectable, NotFoundException } from "@nestjs/common";
import { SearchProductsRepo } from "../../../repositories/product/search-product.repository";
import { SupportedLang, t } from "../../../locales";
import { ProductsRepository } from "../../../repositories/product/product.repository";

@Injectable()
export class ProductService {
  constructor(private readonly productRepo:ProductsRepository) {}

  async getProductForPermissionCheck(id: number , language:SupportedLang) {
    const product = await this.productRepo.getProductForPermissionCheck(id);
    if (!product) throw new NotFoundException(t("productNotFound" , language));
    return product;
  }

async getSingleProduct(id: number, language: SupportedLang) {
  const product = await this.productRepo.getProductById(id, language);
  return product; // could be null
}
}