import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupportedLang, t } from '../../locales';
import { Prisma } from '@prisma/client';
import { IProductAttributeValueRepo } from './Iproduct-attribute-value.repository';

@Injectable()
export class ProductAttributeValueRepo implements IProductAttributeValueRepo{
  constructor(private prisma: PrismaService) {}
async deleteAttribute(productId: number): Promise<{ count: number }> {
  const result = await this.prisma.productattributevalue.deleteMany({
    where: { productId },
  });
  return result;
}
  
  async createMultipleAttributes(
    productId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang
  ):Promise<void> {
    if (!attributes || attributes.length === 0) return;

    const promises = attributes.map(attr =>
      this.prisma.productattributevalue.create({
        data: {
          productId,
          attributeId: attr.attributeId,
          attributeValueId: attr.attributeValueId,
        },
      })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Handle duplicate attribute-value combination
        throw new BadRequestException({
          success: false,
          message: t('validationFailed', language),
          errors: {
            attributeValue: [t('duplicateAttributeValue', language)],
          },
        });
      }

      
      throw new BadRequestException({
        success: false,
        message: t('somethingWentWrong', language),
        errors: { general: [error.message] },
      });
    }
  }
}
