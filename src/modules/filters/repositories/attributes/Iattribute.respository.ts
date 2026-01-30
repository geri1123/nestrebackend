
import { LanguageCode } from '@prisma/client';
export const ATTRIBUTE_REPO = Symbol('ATTRIBUTE_REPO');

export interface IAttributeRepo {
  getValidAttributeIdsBySubcategory(subcategoryId: number): Promise<number[]>;
  
  getAttributesBySubcategoryId(
    subcategoryId: number,
    language?: LanguageCode
  ): Promise<any>;
  

  getAttributeById(attributeId: number): Promise<{ 
    id: number; 
    inputType: string;
    code: string;
  } | null>;
  
  getAttributeValueByCode(
    attributeId: number, 
    valueCode: string
  ): Promise<{ 
    id: number; 
    value_code: string;
  } | null>;
}

