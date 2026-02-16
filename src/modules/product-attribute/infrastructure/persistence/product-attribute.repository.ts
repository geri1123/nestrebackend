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
    const created = await this.prisma.productAttributeValue.create({
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
  attributes: { attributeId: number; attributeValueId: number }[]
): Promise<void> {
  if (!attributes || attributes.length === 0) return;

  await this.prisma.productAttributeValue.createMany({
    data: attributes.map(attr => ({
      productId,
      attributeId: attr.attributeId,
      attributeValueId: attr.attributeValueId,
    })),
    skipDuplicates: true, 
  });
}
  async deleteByProductId(productId: number): Promise<{ count: number }> {
    const result = await this.prisma.productAttributeValue.deleteMany({
      where: { productId },
    });
    return result;
  }

  async findByProductId(productId: number): Promise<ProductAttributeValue[]> {
    const attributes = await this.prisma.productAttributeValue.findMany({
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