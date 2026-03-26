import { Inject, Injectable } from "@nestjs/common";
import {type ISavedProductRepository, SAVED_PRODUCT_REPO } from "../../domain/repositories/Isave-product.repository";

@Injectable()
export class GetSavedProductIdsUseCase {
  constructor(
    @Inject(SAVED_PRODUCT_REPO)
    private readonly savedProductRepo: ISavedProductRepository) {}

  async execute(userId: number): Promise<number[]> {
  const saved = await this.savedProductRepo.findSavedIdsByUserId(userId);
  return saved.map((s) => s.productId);
}
}