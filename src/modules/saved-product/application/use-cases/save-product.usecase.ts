import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import {SAVED_PRODUCT_REPO, type ISavedProductRepository } from '../../domain/repositories/Isave-product.repository';
import { SavedProductEntity } from '../../domain/entities/save-product.entity';
import { SupportedLang, t } from '../../../../locales';
import {type IProductRepository , PRODUCT_REPO } from '../../../product/domain/repositories/product.repository.interface';

@Injectable()
export class SaveProductUseCase {
  constructor( 
    @Inject(SAVED_PRODUCT_REPO) 
    private readonly repository: ISavedProductRepository,
    @Inject(PRODUCT_REPO)
    private readonly prodRepo:IProductRepository,
  ) {}

  async execute(userId: number, productId: number, language: SupportedLang): Promise<SavedProductEntity> {
    // Check if already saved
    const product=await this.prodRepo.findById(productId);

  if (product?.userId === userId) {
    throw new ForbiddenException(t('cannotSaveOwnProduct', language));
  }

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