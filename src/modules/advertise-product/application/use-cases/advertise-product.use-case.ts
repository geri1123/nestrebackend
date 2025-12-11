import { Injectable, BadRequestException, ForbiddenException, Inject } from "@nestjs/common";
import { ProductService } from "../../../product/services/product-service";
import { SupportedLang , t } from "../../../../locales";
import { advertisement_type, wallet_transaction_type } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import {ADVERTISE_REPO, type IProductAdvertisementRepository } from "../../domain/repositories/Iporiduct-advertisement.repository";
import { ChangeWalletBalanceUseCase } from "../../../wallet/application/use-cases/change-wallet-balance.use-case";
import { FindProductByIdUseCase } from "../../../product/application/use-cases/find-product-by-id.use-case";
import { GetPricingUseCase } from "../../../advertisement-pricing/application/use-cases/get-pricing.use-case";

const AD_PRICING = { cheap: 5, normal: 10, premium: 20 };
const AD_DURATION = { cheap: 7, normal: 14, premium: 30 };
@Injectable()
export class AdvertiseProductUseCase {
  constructor(
    @Inject(ADVERTISE_REPO)
    private readonly adRepo: IProductAdvertisementRepository,
    private readonly changeWalletBalanceUseCase: ChangeWalletBalanceUseCase,
    private readonly findProduct: FindProductByIdUseCase,
    private readonly prisma: PrismaService,
    private readonly getPricingUseCase: GetPricingUseCase
  ) {}

  private async validate(productId: number, userId: number, language: SupportedLang) {
    const product = await this.findProduct.execute(productId, language);
    if (!product) throw new BadRequestException(t("productNotFound", language));
    if (product.userId !== userId) throw new ForbiddenException(t("noPermissionToAdvertise", language));
    if (product.status !== "active") throw new BadRequestException(t("productNotActive", language));

    const existingAd = await this.adRepo.getActiveAd(productId);
    if (existingAd) throw new BadRequestException(t("productAlreadyAdvertised", language));

    return product;
  }

  async execute(productId: number, adType: advertisement_type, userId: number, language: SupportedLang) {
    const product = await this.validate(productId, userId, language);

    // ⬅️ MERR PRICING NGA DATABASE
    const pricing = await this.getPricingUseCase.execute(adType);

    if (!pricing.isActive) {
      throw new BadRequestException(t("advertisementTypeNotActive", language));
    }

    // çmimi final me zbritje
    const finalPrice = pricing.discount
      ? pricing.price * (1 - pricing.discount)
      : pricing.price;

    const endDate = new Date(Date.now() + pricing.duration * 24 * 60 * 60 * 1000);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const { transactionId } = await this.changeWalletBalanceUseCase.execute(
          {
            userId,
            type: wallet_transaction_type.purchase,
            amount: finalPrice,
            language,
          },
          tx
        );

        return this.adRepo.createAdvertisementTx(
          tx,
          product.id,
          userId,
          adType,
          new Date(),
          endDate,
          transactionId
        );
      });
    } catch (error) {
      if (error.message === "Insufficient balance") {
        throw new BadRequestException(t("insufficientBalance", language));
      }
      throw error;
    }
  }
}
// @Injectable()
// export class AdvertiseProductUseCase {
//   constructor(
//   @Inject(ADVERTISE_REPO)
//   private readonly adRepo: IProductAdvertisementRepository,
//     private readonly changeWalletBalanceUseCase: ChangeWalletBalanceUseCase,
//     private readonly findProduct: FindProductByIdUseCase,
//       private readonly getPricingUseCase: GetPricingUseCase,
//     private readonly prisma: PrismaService
//   ) {}

//   private async validate(productId: number, userId: number, language: SupportedLang) {
//     const product = await this.findProduct.execute(productId, language);
//     if (!product) throw new BadRequestException(t("productNotFound", language));
//     if (product.userId !== userId) throw new ForbiddenException(t("noPermissionToAdvertise", language));
//     if (product.status !== "active") throw new BadRequestException(t("productNotActive", language));

//     const existingAd = await this.adRepo.getActiveAd(productId);
//     if (existingAd) throw new BadRequestException(t("productAlreadyAdvertised", language));

//     return product;
//   }
// async execute(productId: number, adType: advertisement_type, userId: number, language: SupportedLang) {
//   const product = await this.validate(productId, userId, language);

//   const price = AD_PRICING[adType || "normal"];
//   const endDate = new Date(Date.now() + AD_DURATION[adType || "normal"] * 24*60*60*1000);

//   try {
//     return await this.prisma.$transaction(async (tx) => {
//      const { transactionId } = await this.changeWalletBalanceUseCase.execute(
//   {
//     userId,
//     type: wallet_transaction_type.purchase,
//     amount: price,
//     language,
//   },
//   tx
// );

//       return this.adRepo.createAdvertisementTx(
//         tx,
//         product.id,
//         userId,
//         adType,
//         new Date(),
//         endDate,
//         transactionId
//       );
//     });
//   } catch (error) {

//     if (error.message === "Insufficient balance") {
//       throw new BadRequestException(t("insufficientBalance", language));
//     }
//     throw error; 
//   }
// }
// }
