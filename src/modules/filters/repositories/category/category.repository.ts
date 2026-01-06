import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { ICatRepository } from "./Icategory.repository";
import { LanguageCode } from "@prisma/client";
import { product_status } from "@prisma/client";

@Injectable()
export class CategoryRepository implements ICatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCategories(
    language: LanguageCode,
    status?: product_status,
  ) {
    return this.prisma.category.findMany({
      select: {
        id: true,
        slug: true,  // ✅ Canonical slug from category table
        categorytranslation: {
          where: { language },
          select: { 
            name: true
            // ❌ Remove slug from here - we don't need translation slug
          },
        },
        subcategory: {
          select: {
            id: true,
            categoryId: true,
            slug: true,  // ✅ Canonical slug from subcategory table
            subcategorytranslation: {
              where: { language },
              select: { 
                name: true
                // ❌ Remove slug from here
              },
            },
            _count: {
              select: {
                product: {
                  where: status ? { status } : undefined,
                },
              },
            },
          },
        },
      },
    });
  }
}
