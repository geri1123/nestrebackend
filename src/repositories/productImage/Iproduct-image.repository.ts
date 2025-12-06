import { Prisma  , productimage } from "@prisma/client"
export interface IProductImageRepo{
   addImage(data: { imageUrl: string; productId: number; userId: number }): Promise<productimage>
getImagesByProduct(productId: number): Promise<productimage[]> ;
findById(id: number): Promise<productimage | null>;
 deleteByProductId(productId: number): Promise<void>;

}


export const PRODUCT_IMAGE_REPO = Symbol('PRODUCT_IMAGE_REPO');