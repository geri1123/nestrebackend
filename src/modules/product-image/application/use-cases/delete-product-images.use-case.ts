import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_IMAGE_REPO, type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';
import { ProductImage } from '../../domain/entities/product-image.entity';

@Injectable()
export class DeleteProductImagesByProductIdUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPO)
    private readonly productImageRepository: IProductImageRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(productId: number): Promise<boolean> {
    const images = await this.productImageRepository.findByProductId(productId);

    if (images && images.length > 0) {
      await Promise.all(
        images.map((img) =>
          img.publicId ? this.cloudinaryService.deleteFile(img.publicId) : Promise.resolve()
        )
      );
      await this.productImageRepository.deleteByProductId(productId);
    }

    return true;
  }

  async findByProductId(productId: number): Promise<ProductImage[]> {
    return this.productImageRepository.findByProductId(productId);
  }

  async executeByUrls(urls: string[], publicIds: string[]): Promise<void> {
    await Promise.all(
      publicIds.map((publicId) => this.cloudinaryService.deleteFile(publicId))
    );
    await this.productImageRepository.deleteByUrls(urls);
  }
}