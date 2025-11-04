import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateProductInput } from "../../product/types/create-product-input.type";
@Injectable()
export class CreateProductsRepository {
  constructor(private prisma: PrismaService) {}

    async createProduct(data: CreateProductInput) {
  
    return await this.prisma.product.create({
      data,
    });
  }
}