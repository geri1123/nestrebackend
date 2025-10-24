import {  LanguageCode } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { IAttributeRepo } from "./Iattribute.respository";
import { Injectable } from "@nestjs/common";
@Injectable()
export class AttributeRepo implements IAttributeRepo {
  constructor(private prisma: PrismaService) {}
 async getValidAttributeIdsBySubcategory(subcategoryId: number): Promise<number[]> {
    const attributes = await this.prisma.attribute.findMany({
      where: { subcategoryId },
      select: { id: true },
    });
    return attributes.map(a => a.id);
  }
  async getAttributesBySubcategoryId(
    subcategoryId: number,
    language: LanguageCode = LanguageCode.al
  ) {
    const attributes = await this.prisma.attribute.findMany({
      where: { subcategoryId },
      include: {
        attributeTranslation: {
          where: { language },
          select: { name: true, slug: true },
        },
        values: {
          include: {
            attributeValueTranslations: {
              where: { language },
              select: { name: true, slug: true  },
            },
          },
        },
      },
    });

    return attributes.map(attr => ({
      id: attr.id,
      inputType: attr.inputType,
      name: attr.attributeTranslation[0]?.name ?? "No translation",
      slug: attr.attributeTranslation[0]?.slug ?? null,
      values: attr.values.map(v => ({
        id: v.id,
        name: v.attributeValueTranslations[0]?.name ?? "No translation",
        slug: v.attributeValueTranslations[0]?.slug ?? null,
      })),
    }));
  }
}
