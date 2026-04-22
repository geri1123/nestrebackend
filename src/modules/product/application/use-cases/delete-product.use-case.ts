import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { DeleteProductImagesByProductIdUseCase } from '../../../product-image/application/use-cases/delete-product-images.use-case';
import { DeleteProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/delete-product-attributes.use-case';
import { UserRole } from '@prisma/client';
import { SupportedLang, t } from '../../../../locales';
import { FiltersService } from '../../../filters/filters.service';


@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly deleteImages: DeleteProductImagesByProductIdUseCase,
    private readonly filterService:FiltersService,
  ) {}

  async execute(productId: number, lang: SupportedLang): Promise<void> {
  const product = await this.productRepository.findForPermissionCheck(productId);
  if (!product) throw new NotFoundException(t('productNotFound', lang));


  const images = await this.deleteImages.findByProductId(productId);

  await this.productRepository.deleteWithRelations(productId);

  if (images.length > 0) {
    await Promise.all(
      images
        .filter((img) => img.publicId)
        .map((img) =>
          this.deleteImages.executeByUrls([], [img.publicId!]).catch(console.error)
        )
    );
  }

  this.filterService.refreshCounts();
}
     
}