import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';
import { SavedProductEntity } from '../../domain/entities/save-product.entity';
import { LanguageCode, ProductStatus } from '@prisma/client';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class SavedProductRepository implements ISavedProductRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserAndProduct(userId: number, productId: number): Promise<SavedProductEntity | null> {
    const saved = await this.prisma.savedProduct.findUnique({
      where: { userId_productId: { userId: userId, productId: productId } },
    });

    if (!saved) return null;

    return new SavedProductEntity(
      saved.id,
      saved.productId,
      saved.userId,
      saved.savedAt
    );
  }

  async save(entity: SavedProductEntity): Promise<SavedProductEntity> {
    const saved = await this.prisma.savedProduct.create({
      data: {
        userId: entity.userId,
        productId: entity.productId,
      },
    });

    return new SavedProductEntity(
      saved.id,
      saved.productId,
      saved.userId,
      saved.savedAt
    );
  }

  async delete(userId: number, productId: number): Promise<void> {
    await this.prisma.savedProduct.deleteMany({
      where: { userId: userId, productId: productId },
    });
  }

  async countByUser(userId: number): Promise<number> {
    return this.prisma.savedProduct.count({
      where: { userId: userId, product: { status: ProductStatus.active } },
    });
  }

async findByUserPaginated(userId: number, language: SupportedLang, skip: number, take: number) {
  const lang = language as unknown as LanguageCode;

  return this.prisma.savedProduct.findMany({
    where: {
      userId,
      product: { status: ProductStatus.active },
    },
    select: {
      id: true,
      savedAt: true,
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          area: true,
          status: true,
          userId: true,
          createdAt: true,
          productImage: { select: { imageUrl: true }, take: 2 },
          city: { select: { name: true, country: true } },
          user: { select: { username: true } },
          subcategory: {
            select: {
              subcategoryTranslation: {
                where: { language: lang },
                select: { name: true },
                take: 1,
              },
              category: {
                select: {
                  categoryTranslation: {
                    where: { language: lang },
                    select: { name: true },
                    take: 1,
                  },
                },
              },
            },
          },
          listingType: {
            select: {
              listingTypeTranslation: {
                where: { language: lang },
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      },
    },
    skip,
    take,
    orderBy: { savedAt: 'desc' },
  });
}
}