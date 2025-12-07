import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {PRODUCT_ATTRIBUTE_VALUE_REPO, type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
import {type IAttributeRepository } from '../../domain/repositories/attribute.repository.interface';
import { SupportedLang, t } from '../../../../locales';
import { AttributeRepo } from '../../../filters/repositories/attributes/attributes.repository';
import { ATTRIBUTE_REPO, type IAttributeRepo } from '../../../filters/repositories/attributes/Iattribute.respository';

@Injectable()
export class CreateProductAttributeValuesUseCase {
  constructor(
    @Inject(PRODUCT_ATTRIBUTE_VALUE_REPO)
    private readonly productAttributeValueRepository: IProductAttributeValueRepository,
    @Inject(ATTRIBUTE_REPO)
    private readonly atributerepo: IAttributeRepo
  ) {}

  async execute(
    productId: number,
    subcategoryId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang = 'al'
  ): Promise<void> {
    if (!attributes || attributes.length === 0) return;

    const validAttributeIds = await this.atributerepo.getValidAttributeIdsBySubcategory(subcategoryId);
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