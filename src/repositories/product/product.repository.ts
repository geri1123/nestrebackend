import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { CreateProductInput } from "../../modules/product/types/create-product-input.type";
import { UpdateProductDto } from "../../modules/product/dto/update-product.dto";
import { SupportedLang } from "../../locales";
import { ProductFrontendDto } from "../../modules/product/dto/product-frontend.dto";
import { FirebaseService } from "../../infrastructure/firebase/firebase.service";
@Injectable()
export class ProductsRepository {
  constructor(
    private prisma: PrismaService,
    private firebaseService:FirebaseService
  
  ) {}
async getProductById(id: number, language: SupportedLang) {
  return this.prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      userId: true,
      agencyId: true,
      description: true,
      streetAddress: true,
      createdAt: true,
      updatedAt: true,
      buildYear: true,
      productimage: { select: { imageUrl: true } },
      city: { select: { name: true } },
      subcategory: {
        select: {
          slug: true,
          subcategorytranslation: { where: { language }, select: { name: true }, take: 1 },
          category: {
            select: {
              slug: true,
              categorytranslation: { where: { language }, select: { name: true }, take: 1 },
            },
          },
        },
      },
      listing_type: {
        select: {
          slug: true,
          listing_type_translation: { where: { language }, select: { name: true }, take: 1 },
        },
      },
      user: { select: { username: true, email: true, first_name: true, last_name: true, profile_img: true, phone: true, role: true, status: true } },
      agency: { select: { agency_name: true, logo: true, address: true, phone: true, created_at: true, status: true } },
    },
  });
}

    async createProduct(data: CreateProductInput) {
  
    return await this.prisma.product.create({
      data,
    });
  }




async getProductForPermissionCheck(
  id: number,
): Promise<{ id: number; userId: number | null; agencyId: number | null } | null> {
  return this.prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      agencyId: true,
    },
  });
}

    async findProductById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });


    return product;
  }

  
  private buildUpdateData(existing: any, dto: UpdateProductDto) {
    return {
      title: dto.title ?? existing.title,
      price: dto.price ?? existing.price,
      description: dto.description ?? existing.description,
      streetAddress: dto.address ?? existing.streetAddress,
      area: dto.area ?? existing.area,
      buildYear: dto.buildYear ?? existing.buildYear,
      status: dto.status ?? existing.status,
    };
  }

  
  async updateProductFields(productId: number, dto: UpdateProductDto) {
   
    const existing = await this.findProductById(productId);

    
    const updateData = this.buildUpdateData(existing, dto);

    
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return updatedProduct;
  }
}