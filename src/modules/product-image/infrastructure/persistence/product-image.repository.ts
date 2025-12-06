import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { ProductImage } from '../../domain/entities/product-image.entity';

@Injectable()
export class ProductImageRepository implements IProductImageRepository {
  constructor(private prisma: PrismaService) {}

  async create(image: ProductImage): Promise<ProductImage> {
    const created = await this.prisma.productimage.create({
      data: {
        productId: image.productId,
        userId: image.userId,
        imageUrl: image.imageUrl,
      },
    });

    return ProductImage.create({
      id: created.id,
      productId: created.productId,
      userId: created.userId,
      imageUrl: created.imageUrl || '',
    });
  }

  async findByProductId(productId: number): Promise<ProductImage[]> {
    const images = await this.prisma.productimage.findMany({
      where: { productId },
    });

    return images.map(img =>
      ProductImage.create({
        id: img.id,
        productId: img.productId,
        userId: img.userId,
        imageUrl: img.imageUrl || '',
      })
    );
  }

  async deleteByProductId(productId: number): Promise<void> {
    await this.prisma.productimage.deleteMany({
      where: { productId },
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.productimage.delete({
      where: { id },
    });
  }
}