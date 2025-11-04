import { Prisma  , productimage } from "@prisma/client"
export interface IProductImageRepo{
   addImage(data: { imageUrl: string; productId: number; userId: number }): Promise<productimage>
getImagesByProduct(productId: number): Promise<productimage[]> 
}