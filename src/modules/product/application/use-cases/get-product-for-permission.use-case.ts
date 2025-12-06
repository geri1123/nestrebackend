import { Injectable, NotFoundException } from '@nestjs/common';
import {type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class GetProductForPermissionUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: number, language: SupportedLang) {
    const product = await this.productRepository.findForPermissionCheck(id);
    if (!product) throw new NotFoundException(t('productNotFound', language));
    return product;
  }
}