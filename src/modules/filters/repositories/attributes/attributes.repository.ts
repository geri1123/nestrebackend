

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
            value_code: true,
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
        value_code: v.value_code,  
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
    return await this.prisma.attribute_value.findFirst({
      where: {
        attribute_id: attributeId,
        value_code: valueCode
      },
      select: {
        id: true,
        value_code: true
      }
    });
  }
}
