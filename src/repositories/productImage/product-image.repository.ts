import { Injectable } from "@nestjs/common";
import {  productimage, Prisma } from "@prisma/client";
import { IProductImageRepo } from "./Iproduct-image.repository";
import { PrismaService } from "../../prisma/prisma.service";
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
}