import { Injectable, BadRequestException } from "@nestjs/common";
import { ProductImagesRepository } from "../../../repositories/productImage/product-image.repository";
import { FirebaseService } from "../../../infrastructure/firebase/firebase.service";
import { SupportedLang,t } from "../../../locales";
@Injectable()
export class CreateProductImageService {
  constructor(
    private readonly productImageRepo: ProductImagesRepository,
    private readonly firebaseService: FirebaseService
  ) {}
  async deleteImagesByProductId(productId: number) {
  // Get all images of the product
  const images = await this.productImageRepo.getImagesByProduct(productId);

  if (images && images.length > 0) {
    // Delete files from Firebase
    await Promise.all(
      images.map(img => img.imageUrl && this.firebaseService.deleteFile(img.imageUrl))
    );

    // Delete images from DB
    await this.productImageRepo.deleteByProductId(productId);
  }

  return true;
}
  async uploadProductImages(
    files: Express.Multer.File[],
    productId: number,
    userId: number,
    language: SupportedLang = "al"
  ): Promise<{
    success: boolean;
    message: string;
    images: { id: number; imageUrl: string }[];
  }> {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return {
        success: false,
        message: t("noImage", language),
        images: [],
      };
    }

    if (files.length > 7) {
      throw new BadRequestException(t("maxFiveImagesAllowed", language));
    }

    for (const file of files) {
      if (!file.mimetype.startsWith("image/")) {
        throw new BadRequestException(t("invalidFileType", language));
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException(t("imageTooLarge", language));
      }
    }

    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const filePath = await this.firebaseService.uploadFile(file, `products/${productId}`);
          const imageUrl = this.firebaseService.getPublicUrl(filePath);

    const imageRecord = await this.productImageRepo.addImage({
  imageUrl: filePath, 
  productId,
  userId,
});  
          if (!imageRecord.imageUrl) {
            throw new BadRequestException(t("imageUrlMissingAfterUpload", language));
          }

          return { id: imageRecord.id, imageUrl: imageRecord.imageUrl };
        })
      );

      return {
        success: true,
        message: t("imagesuccessfullyUploaded", language),
        images: uploadedImages,
      };
    } catch (error) {
      console.error("❌ Error uploading product images:", error);
      throw new BadRequestException(t("errorUploadingProductImages", language));
    }
  }
}
