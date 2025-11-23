// import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
// import { PrismaService } from "../../infrastructure/prisma/prisma.service";
// import { ProductAdvertisementRepository } from "../../repositories/advertisement/product-advertisement.repository";
// import { ProductsRepository } from "../../repositories/product/products.repository";
// import { WalletService } from "../wallet/wallet.service";
// import { SupportedLang, t } from "../../locales";
// import { advertisement_type, wallet_transaction_type } from "@prisma/client";


// const AD_PRICING = {
//   cheap: 5,
//   normal: 10,
//   premium: 20,
// };


// const AD_DURATION = {
//   cheap: 7,
//   normal: 14,
//   premium: 30,
// };

// @Injectable()
// export class ProductAdvertisementService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly productRepo: ProductsRepository,
//     private readonly adRepo: ProductAdvertisementRepository,
//     private readonly walletService: WalletService
//   ) {}
// async hasActiveAdvertisement(productId:number){
//     this.adRepo.hasActiveAdvertisement(productId)
// }
  
// //   async hasActiveAdvertisement(productId: number): Promise<boolean> {
// //     const activeAd = await this.prisma.productAdvertisement.findFirst({
// //       where: {
// //         productId,
// //         status: "active",
// //         OR: [
// //           { endDate: null }, // No end date means indefinite
// //           { endDate: { gte: new Date() } }, // End date is in the future
// //         ],
// //       },
// //     });

// //     return !!activeAd;
// //   }

//   /**
//    * Get active advertisement details for a product
//    */
//   async getActiveAdvertisement(productId: number) {
//     return this.prisma.productAdvertisement.findFirst({
//       where: {
//         productId,
//         status: "active",
//         OR: [
//           { endDate: null },
//           { endDate: { gte: new Date() } },
//         ],
//       },
//       include: {
//         product: {
//           select: {
//             id: true,
//             title: true,
//             status: true,
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Advertise a product with wallet payment
//    */
//   async advertiseProduct(
//     productId: number,
//     userId: number,
//     adType: advertisement_type,
//     language: SupportedLang
//   ) {
//     // 1. Check if product exists
//     const product = await this.productRepo.findProductById(productId);
//     if (!product) {
//       throw new NotFoundException(t("productNotFound", language));
//     }

//     // 2. Check if product is active
//     if (product.status !== "active") {
//       throw new BadRequestException(
//         t("productMustBeActive", language) || 
//         "Product must be active to advertise"
//       );
//     }

//     // 3. Check if user owns the product or is associated with the agency
//     if (product.userId !== userId) {
//       // If product belongs to an agency, check if user is part of that agency
//       if (product.agencyId) {
//         const agencyAgent = await this.prisma.agencyagent.findFirst({
//           where: {
//             agency_id: product.agencyId,
//             agent_id: userId,
//             status: "active",
//           },
//         });

//         if (!agencyAgent) {
//           throw new BadRequestException(
//             t("notAuthorizedToAdvertise", language) ||
//             "You are not authorized to advertise this product"
//           );
//         }
//       } else {
//         throw new BadRequestException(
//           t("notAuthorizedToAdvertise", language) ||
//           "You are not authorized to advertise this product"
//         );
//       }
//     }

//     // 4. Check if product is already being advertised
//     const hasActiveAd = await this.hasActiveAdvertisement(productId);
//     if (hasActiveAd) {
//       const activeAd = await this.getActiveAdvertisement(productId);
//       throw new BadRequestException(
//         t("productAlreadyAdvertised", language) ||
//         `Product is still being advertised until ${activeAd?.endDate?.toLocaleDateString() || "indefinitely"}. You cannot advertise this product at the moment.`
//       );
//     }

//     // 5. Get pricing for the ad type
//     const price = AD_PRICING[adType];
//     if (!price) {
//       throw new BadRequestException(
//         t("invalidAdType", language) || "Invalid advertisement type"
//       );
//     }

//     // 6. Calculate end date based on ad type
//     const startDate = new Date();
//     const endDate = new Date();
//     endDate.setDate(endDate.getDate() + AD_DURATION[adType]);

//     // 7. Deduct from wallet (this already handles transactions internally)
//     await this.walletService.changeWalletBalance(
//       userId,
//       wallet_transaction_type.purchase,
//       price,
//       language
//     );

//     // 8. Create the advertisement
//     const advertisement = await this.prisma.productAdvertisement.create({
//       data: {
//         productId,
//         userId,
//         adType,
//         startDate,
//         endDate,
//         status: "active",
//       },
//       include: {
//         product: {
//           select: {
//             id: true,
//             title: true,
//             price: true,
//           },
//         },
//       },
//     });

//     // 9. Link the wallet transaction to the advertisement
//     const walletTx = await this.prisma.walletTransaction.findFirst({
//       where: {
//         wallet: {
//           userId,
//         },
//         type: wallet_transaction_type.purchase,
//         amount: price,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     if (walletTx) {
//       await this.prisma.productAdvertisement.update({
//         where: { id: advertisement.id },
//         data: { walletTxId: walletTx.id },
//       });
//     }

//     return {
//       success: true,
//       advertisement,
//       message: t("productAdvertisedSuccessfully", language) ||
//         `Product advertised successfully! Advertisement will run until ${endDate.toLocaleDateString()}`,
//       price,
//       endDate,
//     };
//   }

//   /**
//    * Get advertisement pricing info
//    */
//   getAdPricing() {
//     return {
//       cheap: {
//         price: AD_PRICING.cheap,
//         duration: AD_DURATION.cheap,
//         description: "Basic advertisement for 7 days",
//       },
//       normal: {
//         price: AD_PRICING.normal,
//         duration: AD_DURATION.normal,
//         description: "Standard advertisement for 14 days",
//       },
//       premium: {
//         price: AD_PRICING.premium,
//         duration: AD_DURATION.premium,
//         description: "Premium advertisement for 30 days with priority placement",
//       },
//     };
//   }

//   /**
//    * Cancel/Expire advertisement manually
//    */
//   async cancelAdvertisement(
//     adId: number,
//     userId: number,
//     language: SupportedLang
//   ) {
//     const ad = await this.prisma.productAdvertisement.findUnique({
//       where: { id: adId },
//       include: {
//         product: true,
//       },
//     });

//     if (!ad) {
//       throw new NotFoundException(
//         t("advertisementNotFound", language) || "Advertisement not found"
//       );
//     }

//     // Check authorization
//     if (ad.userId !== userId && ad.product.userId !== userId) {
//       throw new BadRequestException(
//         t("notAuthorizedToCancel", language) ||
//         "You are not authorized to cancel this advertisement"
//       );
//     }

//     return await this.adRepo.updateStatus(adId, "inactive");
//   }

//   /**
//    * Automatically expire advertisements (can be run as a cron job)
//    */
//   async expireAdvertisements() {
//     const expiredAds = await this.prisma.productAdvertisement.updateMany({
//       where: {
//         status: "active",
//         endDate: {
//           lt: new Date(),
//         },
//       },
//       data: {
//         status: "expired",
//       },
//     });

//     return {
//       expiredCount: expiredAds.count,
//       message: `Expired ${expiredAds.count} advertisements`,
//     };
//   }
// }