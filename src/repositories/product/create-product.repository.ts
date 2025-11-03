// import { PrismaService } from "../../prisma/prisma.service";

// export class CreateProductsRepository {
//   constructor(private prisma: PrismaClient) {}
  
//   async createProduct(
//     data:CreateProductInput
   
//   ): Promise<Product> {
//     // Create product first
//     const product = await this.prisma.product.create({
//       data: {
//         title: data.title,
//         price: data.price,
//         description: data.description,
//         cityId: data.cityId,
//           streetAddress: data.streetAddress, 
//         subcategoryId: data.subcategoryId,
//         listingTypeId: data.listingTypeId,
//         userId: data.userId,
//         agencyId: data.agencyId,
//         area:data.area,
//         buildYear: data.buildYear,
//         status: data.status || "draft",
//       },
//     });
//   }
// }