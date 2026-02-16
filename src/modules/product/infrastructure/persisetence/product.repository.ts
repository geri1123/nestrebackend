import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        title: product.title,
        price: product.price,
        cityId: product.cityId,
        subcategoryId: product.subcategoryId,
        listingTypeId: product.listingTypeId,
        description: product.description,
        streetAddress: product.streetAddress,
        area: product.area,
        buildYear: product.buildYear,
        status: product.status,
        userId: product.userId,
        agencyId: product.agencyId,
      },
    });

    return Product.create({
      id: created.id,
      title: created.title,
      price: created.price,
      cityId: created.cityId,
      subcategoryId: created.subcategoryId,
      listingTypeId: created.listingTypeId,
      userId: created.userId,
      description: created.description || '',
      streetAddress: created.streetAddress || '',
      area: created.area || undefined,
      buildYear: created.buildYear || undefined,
      status: created.status,
      agencyId: created.agencyId || undefined,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return Product.create({
      id: product.id,
      title: product.title,
      price: product.price,
      cityId: product.cityId,
      subcategoryId: product.subcategoryId,
      listingTypeId: product.listingTypeId,
      userId: product.userId,
      description: product.description || '',
      streetAddress: product.streetAddress || '',
      area: product.area || undefined,
      buildYear: product.buildYear || undefined,
      status: product.status,
      agencyId: product.agencyId || undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

async findByIdWithDetails(id: number, language: SupportedLang): Promise<any> {
  return this.prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      userId: true,
      agencyId: true,
      description: true,
      streetAddress: true,
      createdAt: true,
      updatedAt: true,
      buildYear: true,
      subcategoryId: true,
      area: true,
      productImage: { select: { imageUrl: true } },
      city: { select: { name: true } },

      
      productAttributeValue: {
        select: {
          id: true,
          attributeId: true,
          attributeValueId: true,
          attributes: {  
            select: {
              inputType: true,
              attributeTranslation: {  
                where: { language },
                select: { name: true },
                take: 1,
              },
            },
          },
          attributeValues: {  
            select: {
              valueCode: true,
              attributeValueTranslations: {  
                where: { language },
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      },

      subcategory: {
        select: {
          id: true,
          slug: true,
          subcategoryTranslation: {
            where: { language },
            select: { name: true },
            take: 1,
          },
          category: {
            select: {
              id: true,
              slug: true,
              categoryTranslation: {
                where: { language },
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      },

      listingType: {
        select: {
          slug: true,
          listingTypeTranslation: {
            where: { language },
            select: { name: true },
            take: 1,
          },
        },
      },

      user: {
        select: {
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImgUrl: true,
          phone: true,
          role: true,
          status: true,
        },
      },

      agency: {
        select: {
          agencyName: true,
          logo: true,
          address: true,
          phone: true,
          publicCode: true,
          createdAt: true,
          status: true,
        },
      },

      advertisements: {
        where: {
          status: 'active',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          adType: true,
        },
        orderBy: { endDate: 'desc' },
        take: 1,
      },
    },
  });
}

  async findForPermissionCheck(id: number): Promise<{ id: number; userId: number | null; agencyId: number | null } | null> {
    return this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        agencyId: true,
      },
    });
  }

  async update(id: number, data: Partial<Product>): Promise<Product> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.streetAddress !== undefined) updateData.streetAddress = data.streetAddress;
    if (data.area !== undefined) updateData.area = data.area;
    if (data.buildYear !== undefined) updateData.buildYear = data.buildYear;
    if (data.status !== undefined) updateData.status = data.status;

    const updated = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return Product.create({
      id: updated.id,
      title: updated.title,
      price: updated.price,
      cityId: updated.cityId,
      subcategoryId: updated.subcategoryId,
      listingTypeId: updated.listingTypeId,
      userId: updated.userId,
      description: updated.description || '',
      streetAddress: updated.streetAddress || '',
      area: updated.area || undefined,
      buildYear: updated.buildYear || undefined,
      status: updated.status,
      agencyId: updated.agencyId || undefined,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}