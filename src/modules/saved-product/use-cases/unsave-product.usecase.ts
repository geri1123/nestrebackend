import { Inject, Injectable } from '@nestjs/common';
import {type ISavedProductRepository } from '../../../repositories/saved-product/Isave-product.repository';
import { SupportedLang } from '../../../locales';

@Injectable()
export class UnsaveProductUseCase {
  constructor( @Inject('ISavedProductRepository') 
    private readonly repository: ISavedProductRepository,) {}

  async execute(userId: number, productId: number, language: SupportedLang): Promise<void> {
    await this.repository.delete(userId, productId);
  }
}