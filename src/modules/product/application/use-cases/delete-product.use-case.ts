import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PRODUCT_REPO,
  type IProductRepository,
} from '../../domain/repositories/product.repository.interface';
import { GetProductImagesUseCase } from '../../../product-image/application/use-cases/get-product-images.use-case';
import { DeleteProductImagesUseCase } from '../../../product-image/application/use-cases/delete-product-images.use-case';
import { SupportedLang, t } from '../../../../locales';
import { ProductCountsProducer } from '../../../../infrastructure/queue/producers/product-counts.producer';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly getImages: GetProductImagesUseCase,
    private readonly deleteImages: DeleteProductImagesUseCase,
    private readonly productCountsProducer: ProductCountsProducer,
  ) {}

  async execute(productId: number, lang: SupportedLang): Promise<void> {
    // ── 1. Verifikon ekzistencën e produktit 
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException(t('productNotFound', lang));

    // ── 2. Merr publicIds PARA fshirjes — cascade i heq nga DB menjëherë ─────
    const images = await this.getImages.byProductId(productId);
    const publicIds = images
      .map((img) => img.publicId)
      .filter((id): id is string => !!id);

   
    //       ProductImage, ProductAttributeValue, SavedProduct, ProductAdvertisement
    await this.productRepository.deleteWithRelations(productId);

    // ── 4. Pastro Cloudinary 
    await this.deleteImages.fromCloudOnly(publicIds);

    // ── 5. Emit decrement counts në background 
    this.productCountsProducer
      .emitDeleted({
        subcategoryId: product.subcategoryId,
        listingTypeId: product.listingTypeId,
        status: product.status as ProductStatus,
      })
      .catch((err) =>
        console.error('[DeleteProduct] emitDeleted failed:', err),
      );
  }
}