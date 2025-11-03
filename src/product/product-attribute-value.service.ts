import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ProductAttributeValueRepo } from "../repositories/product-attribute-value/product-attribute-value.repository";
import { SupportedLang, t } from "../locales";

@Injectable()
export class ProductAttributeValueService {
  constructor(private readonly prAttValueRepo: ProductAttributeValueRepo) {}

  
 async createPrAttValues(
  productId: number,
  attributes: { attributeId: number; attributeValueId: number }[],
  language: SupportedLang = "al"
): Promise<void> {
  try {
    await this.prAttValueRepo.createMultipleAttributes(productId, attributes, language);
  } catch (error) {
    console.error('Failed to create product attributes', error);
   
  }
}
}
