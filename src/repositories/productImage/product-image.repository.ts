import { Injectable } from "@nestjs/common";
import {  productimage, Prisma } from "@prisma/client";
import { IProductImageRepo } from "./Iproduct-image.repository";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
@Injectable()
export class ProductImagesRepository implements IProductImageRepo {
  constructor(private prisma: PrismaService) {}

   async addImage(data: { imageUrl: string; productId: number; userId: number }): Promise<productimage> {
    return this.prisma.productimage.create({ data });
  }
  async getImagesByProduct(productId: number): Promise<productimage[]> {
    return this.prisma.productimage.findMany({
      where: { productId },
    });
  }

  async findById(id: number): Promise<productimage | null> {
    return this.prisma.productimage.findUnique({
      where: { id },
    });
  }

  
  async deleteByProductId(productId: number): Promise<void> {
    await this.prisma.productimage.deleteMany({
      where: { productId },
    });
  }
}