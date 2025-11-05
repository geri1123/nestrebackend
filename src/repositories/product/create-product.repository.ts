import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductInput } from "../../product/types/create-product-input.type";
import { UpdateProductDto } from "../../product/dto/update-product.dto";
@Injectable()
export class CreateProductsRepository {
  constructor(private prisma: PrismaService) {}

    async createProduct(data: CreateProductInput) {
  
    return await this.prisma.product.create({
      data,
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