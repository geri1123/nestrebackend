import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IProductAttributeValueRepository } from '../../domain/repositories/product-attribute-value.repository.interface';
import { ProductAttributeValueEntity } from '../../domain/entities/product-attribute-value.entity';
import { Prisma } from '@prisma/client';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class ProductAttributeValueRepository implements IProductAttributeValueRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: ProductAttributeValueEntity): Promise<void> {
    await this.prisma.productattributevalue.create({
      data: {
        productId: entity.productId,
        attributeId: entity.attributeId,
        attributeValueId: entity.attributeValueId,
      },
    });
  }

  async createMultiple(entities: ProductAttributeValueEntity[]): Promise<void> {
    if (!entities || entities.length === 0) return;

    const promises = entities.map((entity) =>
      this.prisma.productattributevalue.create({
        data: {
          productId: entity.productId,
          attributeId: entity.attributeId,
          attributeValueId: entity.attributeValueId,
        },
      })
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Duplicate attribute-value combination');
      }
      throw error;
    }
  }

  async deleteByProductId(productId: number): Promise<number> {
    const result = await this.prisma.productattributevalue.deleteMany({ where: { productId } });
    return result.count;
  }
}