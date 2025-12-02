import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';
import { SavedProductEntity } from '../../domain/entities/save-product.entity';
import { LanguageCode, product_status } from '@prisma/client';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class SavedProductRepository implements ISavedProductRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserAndProduct(userId: number, productId: number): Promise<SavedProductEntity | null> {
    const saved = await this.prisma.savedProduct.findUnique({
      where: { user_id_product_id: { user_id: userId, product_id: productId } },
    });

    if (!saved) return null;

    return new SavedProductEntity(
      saved.id,
      saved.product_id,
      saved.user_id,
      saved.saved_at
    );
  }

  async save(entity: SavedProductEntity): Promise<SavedProductEntity> {
    const saved = await this.prisma.savedProduct.create({
      data: {
        user_id: entity.userId,
        product_id: entity.productId,
      },
    });

    return new SavedProductEntity(
      saved.id,
      saved.product_id,
      saved.user_id,
      saved.saved_at
    );
  }

  async delete(userId: number, productId: number): Promise<void> {
    await this.prisma.savedProduct.deleteMany({
      where: { user_id: userId, product_id: productId },
    });
  }

  async countByUser(userId: number): Promise<number> {
    return this.prisma.savedProduct.count({
      where: { user_id: userId, product: { status: product_status.active } },
    });
  }

  async findByUserPaginated(
    userId: number,
    language: SupportedLang,
    skip: number,
    take: number
  ) {
    return this.prisma.savedProduct.findMany({
      where: {
        user_id: userId,
        product: { status: product_status.active },
      },
      include: {
        product: {
          include: {
            productimage: { select: { imageUrl: true }, take: 2 },
            subcategory: {
              select: {
                subcategorytranslation: { where: { language }, select: { name: true } },
                category: {
                  select: {
                    categorytranslation: { where: { language }, select: { name: true } },
                  },
                },
              },
            },
            user: { select: { username: true } },
            city: { select: { name: true, country: true } },
            listing_type: {
              select: {
                listing_type_translation: { where: { language }, select: { name: true } },
              },
            },
          },
        },
      },
      skip,
      take,
      orderBy: { saved_at: 'desc' },
    });
  }
}
