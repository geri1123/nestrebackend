import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { SupportedLang } from "../../locales";
import { SavedProduct } from "@prisma/client";

@Injectable()
export class SaveProductRepository {
  constructor(private prisma: PrismaService) {}

  async createSave(userId: number, productId: number) :Promise<SavedProduct>{
    return this.prisma.savedProduct.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
    });
  }

  async removeSave(userId: number, productId: number):Promise<any> {
    return this.prisma.savedProduct.deleteMany({
      where: { user_id: userId, product_id: productId },
    });
  }
async countSaved(userId: number): Promise<number> {
  return this.prisma.savedProduct.count({
    where: { user_id: userId },
  });
}
async getSavedProducts(
  userId: number,
  language: SupportedLang = 'al',
  skip?: number,
  take?: number
) :Promise<any>{
  return this.prisma.savedProduct.findMany({
    where: { user_id: userId },
    include: {
      product: {
        include: {
          productimage: { select: { imageUrl: true }, take: 2, orderBy: { id: 'asc' } },
          subcategory: {
            select: {
              id: true,
              subcategorytranslation: { where: { language }, select: { name: true } },
              category: {
                select: {
                  id: true,
                  categorytranslation: { where: { language }, select: { name: true } },
                },
              },
            },
          },
          user: {
            select: {
              username: true,
              agency: { select: { agency_name: true, logo: true } },
            },
          },
          city: {
            select: { id: true, name: true, country: { select: { id: true, name: true, code: true } } },
          },
          listing_type: {
            select: {
              id: true,
              listing_type_translation: { where: { language }, select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { saved_at: 'desc' },
    skip, 
    take, 
  });
}
  async isSaved(userId: number, productId: number) {
    const existing = await this.prisma.savedProduct.findUnique({
      where: { user_id_product_id: { user_id: userId, product_id: productId } },
    });
    return !!existing;
  }
}