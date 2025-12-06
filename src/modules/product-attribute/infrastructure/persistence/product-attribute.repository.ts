import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IProductAttributeValueRepository } from '../../domain/repositories/product-attribute.repository.interface';
import { ProductAttributeValue } from '../../domain/entities/product-attribute-value.entity';
import { SupportedLang, t } from '../../../../locales';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductAttributeValueRepository implements IProductAttributeValueRepository {
  constructor(private prisma: PrismaService) {}

  async create(attributeValue: ProductAttributeValue): Promise<ProductAttributeValue> {
    const created = await this.prisma.productattributevalue.create({
      data: {
        productId: attributeValue.productId,
        attributeId: attributeValue.attributeId,
        attributeValueId: attributeValue.attributeValueId,
      },
    });

    return ProductAttributeValue.create({
      id: created.id,
      productId: created.productId,
      attributeId: created.attributeId,
      attributeValueId: created.attributeValueId,
    });
  }

  async createMultiple(
    productId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang
  ): Promise<void> {
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

  async deleteByProductId(productId: number): Promise<{ count: number }> {
    const result = await this.prisma.productattributevalue.deleteMany({
      where: { productId },
    });
    return result;
  }

  async findByProductId(productId: number): Promise<ProductAttributeValue[]> {
    const attributes = await this.prisma.productattributevalue.findMany({
      where: { productId },
    });

    return attributes.map(attr =>
      ProductAttributeValue.create({
        id: attr.id,
        productId: attr.productId,
        attributeId: attr.attributeId,
        attributeValueId: attr.attributeValueId,
      })
    );
  }
}