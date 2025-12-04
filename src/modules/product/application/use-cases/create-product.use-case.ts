import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY_TOKEN,type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductEntity } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../dto/create-product.dto';
import { SupportedLang } from '../../../../locales';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepo: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto, userId: number, agencyId?: number): Promise<number> {
    const entity = ProductEntity.create({
      title: dto.title,
      price: dto.price,
      cityId: dto.cityId,
      subcategoryId: dto.subcategoryId,
      listingTypeId: dto.listingTypeId,
      description: dto.description,
      streetAddress: dto.address,
      area: dto.area ? Number(dto.area) : undefined,
    buildYear: dto.buildYear ?? undefined,
      status: dto.status || 'draft',
      userId,
      agencyId,
    });

    return this.productRepo.create(entity);
  }
}