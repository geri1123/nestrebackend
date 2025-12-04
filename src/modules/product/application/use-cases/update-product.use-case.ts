import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPOSITORY_TOKEN, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(productId: number, dto: UpdateProductDto, language: SupportedLang): Promise<void> {
    const entity = await this.productRepo.findById(productId);
    if (!entity) {
      throw new NotFoundException(t('productNotFound', language));
    }

    entity.update({
      title: dto.title,
      price: dto.price,
      description: dto.description,
      streetAddress: dto.address,
      area: dto.area,
      buildYear: dto.buildYear,
      status: dto.status,
    });

    await this.productRepo.update(productId, entity);
  }
}