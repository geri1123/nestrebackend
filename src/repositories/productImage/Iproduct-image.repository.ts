import { Prisma  , productimage } from "@prisma/client"
export interface IProductImageRepo{
    addImage(data: Prisma.productimageCreateInput): Promise<productimage> 
getImagesByProduct(productId: number): Promise<productimage[]> 
}