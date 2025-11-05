import { SupportedLang } from "../../locales";

export interface IProductAttributeValueRepo{
    deleteAttribute(productId: number): Promise<{ count: number }>,
     createMultipleAttributes(
    productId: number,
    attributes: { attributeId: number; attributeValueId: number }[],
    language: SupportedLang
  ):Promise<void> 
}