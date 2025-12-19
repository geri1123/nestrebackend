import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { ICatRepository } from "./Icategory.repository";
import { LanguageCode } from "@prisma/client";
import { product_status } from "@prisma/client";
import { CategoryDto } from "../../dto/filters.dto.js";
@Injectable()
export class CategoryRepository implements ICatRepository {
  constructor(private readonly prisma: PrismaService) {}

async getAllCategories(
  language: LanguageCode,
  status?: product_status,
) {
  return this.prisma.category.findMany({
    select: {  // ← Use select instead of include
      id: true,
      slug: true,
      // Leave out createdAt and updated_at
      categorytranslation: {
        where: { language },
        select: { name: true, slug: true },
      },
      subcategory: {
        select: {
          id: true,
          categoryId: true,
          slug: true,
          subcategorytranslation: {
            where: { language },
            select: { name: true, slug: true },
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

