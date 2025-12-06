import { Injectable } from '@nestjs/common';
import {type IProductImageRepository } from '../../domain/repositories/product-image.repository.interface';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';

@Injectable()
export class DeleteProductImagesByProductIdUseCase {
  constructor(
    private readonly productImageRepository: IProductImageRepository,
    private readonly firebaseService: FirebaseService
  ) {}

  async execute(productId: number): Promise<boolean> {
    const images = await this.productImageRepository.findByProductId(productId);

    if (images && images.length > 0) {
      await Promise.all(
        images.map(img => img.imageUrl && this.firebaseService.deleteFile(img.imageUrl))
      );

      await this.productImageRepository.deleteByProductId(productId);
    }

    return true;
  }
}