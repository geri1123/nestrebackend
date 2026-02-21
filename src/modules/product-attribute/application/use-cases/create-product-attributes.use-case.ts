import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PRODUCT_ATTRIBUTE_VALUE_REPO, type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
import { SupportedLang, t } from '../../../../locales';
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
    attributes: { attributeId: number; attributeValueId?: number }[],
    language: SupportedLang = 'al'
  ): Promise<void> {
    if (!attributes || attributes.length === 0) return;

    const validAttributeIds = await this.atributerepo.getValidAttributeIdsBySubcategory(subcategoryId);
    const validAttributeIdsSet = new Set(validAttributeIds);

    const processedAttributes: { attributeId: number; attributeValueId: number }[] = [];

    for (const attr of attributes) {
      const attrId = Number(attr.attributeId);
      const attrValueId = attr.attributeValueId ? Number(attr.attributeValueId) : undefined;

      if (!validAttributeIdsSet.has(attrId)) {
        console.warn(`Invalid attribute ${attrId} for subcategory ${subcategoryId}`);
        throw new BadRequestException({
          success: false,
          message: t('validationFailed', language),
          errors: {
            attributes: [t('invalidAttributeForSubcategory', language)],
          },
        });
      }

      if (!attrValueId) {
        const attributeDetails = await this.atributerepo.getAttributeById(attrId);

        if (attributeDetails?.inputType === 'boolean') {
          const trueValue = await this.atributerepo.getAttributeValueByCode(attrId, 'true');

          if (!trueValue) {
            throw new BadRequestException({
              success: false,
              message: t('validationFailed', language),
              errors: {
                attributes: [`Boolean attribute ${attrId} is missing 'true' value in database`],
              },
            });
          }

          processedAttributes.push({ attributeId: attrId, attributeValueId: trueValue.id });
        } else {
          throw new BadRequestException({
            success: false,
            message: t('validationFailed', language),
            errors: {
              attributes: [`attributeValueId is required for attribute ${attrId}`],
            },
          });
        }
      } else {
        processedAttributes.push({ attributeId: attrId, attributeValueId: attrValueId });
      }
    }

    try {
      await this.productAttributeValueRepository.createMultiple(productId, processedAttributes);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException({
          success: false,
          message: t('validationFailed', language),
          errors: {
            attributeValue: [t('duplicateAttributeValue', language)],
          },
        });
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException({
        success: false,
        message: t('somethingWentWrong', language),
        errors: { general: [errorMessage] },
      });
    }
  }
}