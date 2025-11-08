import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateProductImageService } from "./create-product-images.service";
import { ProductAttributeValueService } from "./product-attribute-value.service";
import { SupportedLang, t } from "../../../locales";
import { CreateProductDto } from "../dto/create-product.dto";
import { CreateProductsRepository } from "../../../repositories/product/create-product.repository";

@Injectable()
export class CreateProductService {
  constructor(
    private readonly createProductImageService: CreateProductImageService,
    private readonly productAttributeValueService: ProductAttributeValueService,
    private readonly createProductsRepo: CreateProductsRepository
  ) {}

  async createProduct(
    dto: CreateProductDto,
    images: Express.Multer.File[],
    language: SupportedLang = "al",
       userId: number,
    agencyId?: number 
  ) {
 

    try {
    
      const product = await this.createProductsRepo.createProduct({
        title: dto.title,
        price: dto.price,
        cityId: dto.cityId,
        subcategoryId: dto.subcategoryId,
        listingTypeId: dto.listingTypeId,
        description: dto.description || "",
        streetAddress: dto.address || "",
        area: dto.area ? Number(dto.area) : undefined,
        buildYear: dto.buildYear ? Number(dto.buildYear) : undefined,
        status: dto.status || "draft",
        userId,
        agencyId,
      });

    
      const tasks: Promise<any>[] = [];

     
      tasks.push(
        images?.length
          ? this.createProductImageService
              .uploadProductImages(images, product.id, userId, language)
              .then((result) => result.images)
          : Promise.resolve([])
      );

     
      tasks.push(
        dto.attributes?.length
          ? this.productAttributeValueService.createPrAttValues(
  product.id,
  dto.subcategoryId, 
  dto.attributes,   
  language
)
          : Promise.resolve(undefined)
      );

      const [uploadedImages] = await Promise.all(tasks);

      // 3️⃣ Return result
      return {
        success: true,
        message: t("successadded", language),
        product: {
          ...product,
          images: uploadedImages,
        },
      };
    } catch (error) {
      console.error("❌ Error creating product:", error);
      throw new BadRequestException({
        success: false,
        message: t("failedCreatingProduct", language),
        errors:
          error?.errors || { general: [t("failedCreatingProduct", language)] },
      });
    }
  }
}
