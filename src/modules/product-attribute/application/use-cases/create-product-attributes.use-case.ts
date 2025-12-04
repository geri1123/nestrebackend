import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute-value.repository.interface';
import { ProductAttributeValueEntity } from '../../domain/entities/product-attribute-value.entity';
import { AttributeRepo } from '../../../filters/repositories/attributes/attributes.repository';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class CreateProductAttributesUseCase {
  constructor(
    @Inject(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN)
    private readonly attributeValueRepo: IProductAttributeValueRepository,
    private readonly attributeRepo: AttributeRepo,
  ) {}

  async execute(
    productId: number,
    subcategoryId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang
  ): Promise<void> {
    if (!attributes || attributes.length === 0) return;

    const validAttributeIds = await this.attributeRepo.getValidAttributeIdsBySubcategory(subcategoryId);
const validAttributeIdsSet = new Set(validAttributeIds);

for (const attr of attributes) {
  if (!validAttributeIdsSet.has(attr.attributeId)) {
    throw new BadRequestException(t('invalidAttributeForSubcategory', language));
  }
}

const entities = attributes.map((attr) =>
  ProductAttributeValueEntity.create({
    productId,
    attributeId: attr.attributeId,
    attributeValueId: attr.attributeValueId,
  })
);

await this.attributeValueRepo.createMultiple(entities);

  }
}