import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import {type ISavedProductRepository } from '../../../repositories/saved-product/Isave-product.repository';
import { SavedProductEntity } from '../domain/save-product.entity';
import { SupportedLang, t } from '../../../locales';

@Injectable()
export class SaveProductUseCase {
  constructor( @Inject('ISavedProductRepository') // Add this decorator
    private readonly repository: ISavedProductRepository,) {}

  async execute(userId: number, productId: number, language: SupportedLang): Promise<SavedProductEntity> {
    // Check if already saved
    const existing = await this.repository.findByUserAndProduct(userId, productId);
    
    if (existing) {
      throw new ForbiddenException(t('productAlreadySaved', language));
    }

    // Create and save
    const savedProduct = SavedProductEntity.create(userId, productId);
    const result = await this.repository.save(savedProduct);

    if (!result) {
      throw new ForbiddenException(t('saveFailed', language));
    }

    return result;
  }
}