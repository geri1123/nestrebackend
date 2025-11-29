import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UnsaveProductUseCase {
  constructor(
    @Inject('ISavedProductRepository')
    private readonly repository: ISavedProductRepository
  ) {}

  async execute(userId: number, productId: number, language: SupportedLang): Promise<void> {
   
    const savedProduct = await this.repository.findByUserAndProduct(userId, productId);
    
    if (!savedProduct) {
      throw new NotFoundException(t('productNotFound', language));
    }

   
    await this.repository.delete(userId, productId);
  }
}