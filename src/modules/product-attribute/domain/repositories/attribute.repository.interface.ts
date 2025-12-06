export interface IAttributeRepository {
  getValidAttributeIdsBySubcategory(subcategoryId: number): Promise<number[]>;
}