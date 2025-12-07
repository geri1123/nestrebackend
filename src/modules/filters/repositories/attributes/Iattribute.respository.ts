
import { LanguageCode } from '@prisma/client';
export const ATTRIBUTE_REPO = Symbol('ATTRIBUTE_REPO');

export interface IAttributeRepo {
 getValidAttributeIdsBySubcategory(subcategoryId: number): Promise<number[]>
  getAttributesBySubcategoryId(
    subcategoryId: number,
    language?: LanguageCode
  ): Promise<any>; 
}