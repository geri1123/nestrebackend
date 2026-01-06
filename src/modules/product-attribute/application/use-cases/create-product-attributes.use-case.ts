// import { Injectable, BadRequestException, Inject } from '@nestjs/common';
// import {PRODUCT_ATTRIBUTE_VALUE_REPO, type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
// import { SupportedLang, t } from '../../../../locales';
// import { ATTRIBUTE_REPO, type IAttributeRepo } from '../../../filters/repositories/attributes/Iattribute.respository';

// @Injectable()
// export class CreateProductAttributeValuesUseCase {
//   constructor(
//     @Inject(PRODUCT_ATTRIBUTE_VALUE_REPO)
//     private readonly productAttributeValueRepository: IProductAttributeValueRepository,
//     @Inject(ATTRIBUTE_REPO)
//     private readonly atributerepo: IAttributeRepo
//   ) {}

//   async execute(
//     productId: number,
//     subcategoryId: number,
//     attributes: { attributeId: number; attributeValueId: number }[],
//     language: SupportedLang = 'al'
//   ): Promise<void> {
//     if (!attributes || attributes.length === 0) return;

//     const validAttributeIds = await this.atributerepo.getValidAttributeIdsBySubcategory(subcategoryId);
//     const validAttributeIdsSet = new Set(validAttributeIds);

//     for (const attr of attributes) {
//       if (!validAttributeIdsSet.has(attr.attributeId)) {
//         console.warn(`Invalid attribute ${attr.attributeId} for subcategory ${subcategoryId}`);
//         throw new BadRequestException({
//           success: false,
//           message: t('validationFailed', language),
//           errors: {
//             attributes: [t('invalidAttributeForSubcategory', language)],
//           },
//         });
//       }
//     }

//     await this.productAttributeValueRepository.createMultiple(productId, attributes, language);
//   }
// }

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {PRODUCT_ATTRIBUTE_VALUE_REPO, type IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
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
    attributes: { attributeId: number; attributeValueId?: number }[], // Shto '?' këtu
    language: SupportedLang = 'al'
  ): Promise<void> {
    if (!attributes || attributes.length === 0) return;

    const validAttributeIds = await this.atributerepo.getValidAttributeIdsBySubcategory(subcategoryId);
    const validAttributeIdsSet = new Set(validAttributeIds);

    // Proceso atributet dhe trajto llojet boolean
    const processedAttributes: { attributeId: number; attributeValueId: number }[] = [];

    for (const attr of attributes) {
      // Valido që atributi i përket subcategorisë
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

      // Nëse attributeValueId mungon, kontrollo nëse është boolean
      if (!attr.attributeValueId) {
        // Merr detajet e atributit për të kontrolluar nëse është boolean
        const attributeDetails = await this.atributerepo.getAttributeById(attr.attributeId);
        
        if (attributeDetails?.inputType === 'boolean') {
          // Gjej vlerën 'true' për këtë atribut boolean
          const trueValue = await this.atributerepo.getAttributeValueByCode(
            attr.attributeId, 
            'true'
          );
          
          if (!trueValue) {
            throw new BadRequestException({
              success: false,
              message: t('validationFailed', language),
              errors: {
                attributes: [`Boolean attribute ${attr.attributeId} is missing 'true' value in database`],
              },
            });
          }
          
          processedAttributes.push({
            attributeId: attr.attributeId,
            attributeValueId: trueValue.id
          });
        } else {
          // Atribut jo-boolean duhet të ketë attributeValueId
          throw new BadRequestException({
            success: false,
            message: t('validationFailed', language),
            errors: {
              attributes: [`attributeValueId is required for attribute ${attr.attributeId}`],
            },
          });
        }
      } else {
        // attributeValueId është dhënë, përdore siç është
        processedAttributes.push({
          attributeId: attr.attributeId,
          attributeValueId: attr.attributeValueId
        });
      }
    }

    await this.productAttributeValueRepository.createMultiple(
      productId, 
      processedAttributes, 
      language
    );
  }
}