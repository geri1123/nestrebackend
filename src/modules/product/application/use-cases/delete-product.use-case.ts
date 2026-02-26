import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PRODUCT_REPO, type IProductRepository } from '../../domain/repositories/product.repository.interface';
import { DeleteProductImagesByProductIdUseCase } from '../../../product-image/application/use-cases/delete-product-images.use-case';
import { DeleteProductAttributeValuesUseCase } from '../../../product-attribute/application/use-cases/delete-product-attributes.use-case';
import { UserRole } from '@prisma/client';
import { SupportedLang, t } from '../../../../locales';


@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly deleteImages: DeleteProductImagesByProductIdUseCase,
  ) {}

  async execute(productId: number, userId: number, userRole: string, lang: SupportedLang): Promise<void> {
    const product = await this.productRepository.findForPermissionCheck(productId);
    if (!product) throw new NotFoundException('Product not found');

    const isOwner = product.userId === userId;
    const isAdmin = userRole === UserRole.agency_owner;
    if (!isOwner && !isAdmin) throw new ForbiddenException(t('insufficientPermissions', lang));

    
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
  }
}