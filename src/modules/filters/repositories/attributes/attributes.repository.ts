import { LanguageCode } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
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
      select: {
        id: true,
        code: true,
        inputType: true,
        attributeTranslation: {
          where: { language },
          select: { 
            name: true
          },
        },
        values: {
          select: {
            id: true,
            valueCode: true,
            attributeValueTranslations: {
              where: { language },
              select: { 
                name: true
              },
            },
          },
        },
      },
    });

    return attributes.map(attr => ({
      id: attr.id,
      code: attr.code, 
      inputType: attr.inputType,
      name: attr.attributeTranslation[0]?.name ?? "No translation",
      values: attr.values.map(v => ({
        id: v.id,
        valueCode: v.valueCode,  // Map camelCase to snake_case
        name: v.attributeValueTranslations[0]?.name ?? "No translation",
      })),
    }));
  }

  async getAttributeById(attributeId: number) {
    return await this.prisma.attribute.findUnique({
      where: { id: attributeId },
      select: {
        id: true,
        inputType: true,
        code: true
      }
    });
  }

  async getAttributeValueByCode(attributeId: number, valueCode: string) {
  const result = await this.prisma.attributeValue.findFirst({
    where: {
      attributeId,
      valueCode,
    },
    select: {
      id: true,
      valueCode: true,
    },
  });

  if (!result) return null;

  return {
    id: result.id,
    valueCode: result.valueCode, 
  };
}
}