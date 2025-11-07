import { Injectable, NotFoundException } from "@nestjs/common";
import { SearchProductsRepo } from "../../repositories/product/search-product.repository";
import { SupportedLang, t } from "../../locales";

@Injectable()
export class ProductService {
  constructor(private readonly searchProductsRepo: SearchProductsRepo) {}

  async getProductForPermissionCheck(id: number , language:SupportedLang) {
    const product = await this.searchProductsRepo.getProductForPermissionCheck(id);
    if (!product) throw new NotFoundException(t("productNotFound" , language));
    return product;
  }
}