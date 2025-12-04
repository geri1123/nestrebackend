import { Injectable, Inject } from '@nestjs/common';
import { PRODUCT_IMAGE_REPOSITORY_TOKEN,type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';

@Injectable()
export class DeleteProductImagesUseCase {
  constructor(
    @Inject(PRODUCT_IMAGE_REPOSITORY_TOKEN)
    private readonly imageRepo: IProductImageRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(productId: number): Promise<void> {
    const images = await this.imageRepo.findByProductId(productId);

    if (images.length > 0) {
     await Promise.all(
  images
    .filter(img => img.imageUrl) 
    .map(img => this.firebaseService.deleteFile(img.imageUrl!))
)
      await this.imageRepo.deleteByProductId(productId);
    }
  }
}
