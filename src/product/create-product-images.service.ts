import { Injectable, BadRequestException } from "@nestjs/common";
import { ProductImagesRepository } from "../repositories/productImage/product-image.repository";
import { FirebaseService } from "../firebase/firebase.service";
import { SupportedLang, t } from "../locales";

@Injectable()
export class CreateProductImageService {
  constructor(
    private readonly productImageRepo: ProductImagesRepository,
    private readonly firebaseService: FirebaseService
  ) {}
async uploadProductImages(files: Express.Multer.File[], productId: number, userId: number , language:SupportedLang="al") {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return []; 
  }

  if (files.length > 5) {
    throw new BadRequestException("You can upload up to 5 images only");
  }

  try {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        try {
          
          const filePath = await this.firebaseService.uploadFile(file, `products/${productId}`);

          
          const imageUrl = this.firebaseService.getPublicUrl(filePath);

          
          const imageRecord = await this.productImageRepo.addImage({
            imageUrl,
            product: { connect: { id: productId } },
            user: { connect: { id: userId } },
          });

          
          return {
            id: imageRecord.id,
            imageUrl: imageRecord.imageUrl,
          };
        } catch (err) {
          console.error("❌ Failed to upload one image:", err);
          throw new BadRequestException("Failed to upload image");
        }
      })
    );

  
    return {
      success: true,
      message: t("imagesuccessfullyUploaded", language),
      images: uploadedImages,
    };
  } catch (error) {
    console.error("❌ Error uploading product images:", error);
    throw new BadRequestException("Error uploading product images");
  }
}
}
