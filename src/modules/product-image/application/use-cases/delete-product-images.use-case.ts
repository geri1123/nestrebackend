import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_IMAGE_REPO,
  type IProductImageRepository,
} from '../../domain/repositories/product-image.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';


@Injectable()
export class DeleteProductImagesUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPO)
    private readonly productImageRepository: IProductImageRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  
  async byIds(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    const images = await this.productImageRepository.findByIds(ids);

    await Promise.all(
      images.map((img) =>
        img.publicId
          ? this.cloudinaryService.deleteFile(img.publicId).catch(console.error)
          : Promise.resolve(),
      ),
    );

    await this.productImageRepository.deleteByIds(ids);
  }

 
  async fromCloudOnly(publicIds: string[]): Promise<void> {
    if (publicIds.length === 0) return;

    await Promise.all(
      publicIds.map((id) =>
        this.cloudinaryService.deleteFile(id).catch(console.error),
      ),
    );
  }

  
  async byProductId(productId: number): Promise<void> {
    const images =
      await this.productImageRepository.findByProductId(productId);

    if (images.length === 0) return;

    await Promise.all(
      images.map((img) =>
        img.publicId
          ? this.cloudinaryService.deleteFile(img.publicId).catch(console.error)
          : Promise.resolve(),
      ),
    );

    await this.productImageRepository.deleteByProductId(productId);
  }
}