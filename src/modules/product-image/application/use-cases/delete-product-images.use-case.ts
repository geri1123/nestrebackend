import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_IMAGE_REPO, type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { CloudinaryService } from '../../../../infrastructure/cloudinary/cloudinary.service';  // Changed

@Injectable()
export class DeleteProductImagesByProductIdUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPO)
    private readonly productImageRepository: IProductImageRepository,
    private readonly cloudinaryService: CloudinaryService  
  ) {}

  async execute(productId: number): Promise<boolean> {
    const images = await this.productImageRepository.findByProductId(productId);

    if (images && images.length > 0) {
      await Promise.all(
        images.map(img => 
          img.publicId && this.cloudinaryService.deleteFile(img.publicId)  
        )
      );

      await this.productImageRepository.deleteByProductId(productId);
    }

    return true;
  }
}