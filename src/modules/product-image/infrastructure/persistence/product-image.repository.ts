import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { ProductImageEntity } from '../../domain/entities/product-image.entity';

@Injectable()
export class ProductImageRepository implements IProductImageRepository {
  constructor(private prisma: PrismaService) {}

  async create(entity: ProductImageEntity): Promise<number> {
    const image = await this.prisma.productimage.create({
      data: {
        imageUrl: entity.imageUrl,
        productId: entity.productId,
        userId: entity.userId,
      },
    });
    return image.id;
  }

  async findById(id: number): Promise<ProductImageEntity | null> {
    const image = await this.prisma.productimage.findUnique({ where: { id } });
    if (!image) return null;
    return new ProductImageEntity(image.id, image.imageUrl, image.productId, image.userId);
  }

  async findByProductId(productId: number): Promise<ProductImageEntity[]> {
    const images = await this.prisma.productimage.findMany({ where: { productId } });
    return images.map((img) => new ProductImageEntity(img.id, img.imageUrl, img.productId, img.userId));
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.prisma.productimage.deleteMany({ where: { productId } });
  }
}