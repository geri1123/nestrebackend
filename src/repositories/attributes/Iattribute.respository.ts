
import { LanguageCode } from '@prisma/client';

export interface IAttributeRepo {
 getValidAttributeIdsBySubcategory(subcategoryId: number): Promise<number[]>
  getAttributesBySubcategoryId(
    subcategoryId: number,
    language?: LanguageCode
  ): Promise<any>; 
}