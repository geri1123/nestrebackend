import { Injectable, BadRequestException } from '@nestjs/common';
import {type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
import {type IAttributeRepository } from '../../domain/repositories/attribute.repository.interface';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class CreateProductAttributeValuesUseCase {
  constructor(
    private readonly productAttributeValueRepository: IProductAttributeValueRepository,
    private readonly attributeRepository: IAttributeRepository
  ) {}

  async execute(
    productId: number,
    subcategoryId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang = 'al'
  ): Promise<void> {
    if (!attributes || attributes.length === 0) return;

    const validAttributeIds = await this.attributeRepository.getValidAttributeIdsBySubcategory(subcategoryId);
    const validAttributeIdsSet = new Set(validAttributeIds);

    for (const attr of attributes) {
      if (!validAttributeIdsSet.has(attr.attributeId)) {
        console.warn(`Invalid attribute ${attr.attributeId} for subcategory ${subcategoryId}`);
        throw new BadRequestException({
          success: false,
          message: t('validationFailed', language),
          errors: {
            attributes: [t('invalidAttributeForSubcategory', language)],
          },
        });
      }
    }

    await this.productAttributeValueRepository.createMultiple(productId, attributes, language);
  }
}