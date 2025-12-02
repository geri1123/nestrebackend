import { Injectable, BadRequestException } from "@nestjs/common";
import { ProductAttributeValueRepo } from "../../../repositories/product-attribute-value/product-attribute-value.repository";
import { SupportedLang, t } from "../../../locales";
import { AttributeRepo } from "../../filters/repositories/attributes/attributes.repository";

@Injectable()
export class ProductAttributeValueService {
  constructor(
    private readonly prAttValueRepo: ProductAttributeValueRepo,
    private readonly attributeRepo: AttributeRepo,
  ) {}
  async deleteAttributes(productId: number): Promise<{ count: number }> {
    // Call the repository method
    const result = await this.prAttValueRepo.deleteAttribute(productId);
    return result;
  }

  async createPrAttValues(
    productId: number,
    subcategoryId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang = "al"
  ): Promise<void> {
    if (!attributes || attributes.length === 0) return;

    
    const validAttributeIds = await this.attributeRepo.getValidAttributeIdsBySubcategory(subcategoryId);


    const validAttributeIdsSet = new Set(validAttributeIds);

    
    for (const attr of attributes) {
      if (!validAttributeIdsSet.has(attr.attributeId)) {
        console.warn(` Invalid attribute ${attr.attributeId} for subcategory ${subcategoryId}`);
        throw new BadRequestException({
          success: false,
          message: t("validationFailed", language),
          errors: {
            attributes: [t("invalidAttributeForSubcategory", language)],
          },
        });
      }
    }

    // 4️⃣ If all are valid, create in DB
    await this.prAttValueRepo.createMultipleAttributes(productId, attributes, language);
  }
}