import { Injectable, BadRequestException, ForbiddenException, Inject } from "@nestjs/common";

import { SupportedLang , t } from "../../../../locales";
import { AdvertisementType, WalletTransactionType } from "@prisma/client";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import {ADVERTISE_REPO, type IProductAdvertisementRepository } from "../../domain/repositories/Iporiduct-advertisement.repository";
import { ChangeWalletBalanceUseCase } from "../../../wallet/application/use-cases/change-wallet-balance.use-case";
import { FindProductByIdUseCase } from "../../../product/application/use-cases/find-product-by-id.use-case";
import { GetPricingUseCase } from "../../../advertisement-pricing/application/use-cases/get-pricing.use-case";

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

  async execute(productId: number, adType: AdvertisementType, userId: number, language: SupportedLang) {
    const product = await this.validate(productId, userId, language);

    const pricing = await this.getPricingUseCase.execute(adType);

    if (!pricing.isActive) {
      throw new BadRequestException(t("advertisementTypeNotActive", language));
    }

    const finalPrice = pricing.discount
      ? Math.round((pricing.price - (pricing.price * pricing.discount) / 100) * 100) / 100
      : pricing.price;

    const endDate = new Date(Date.now() + pricing.duration * 24 * 60 * 60 * 1000);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const { transactionId } = await this.changeWalletBalanceUseCase.execute(
          {
            userId,
            type: WalletTransactionType.purchase,
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
    } catch (error: any) {
      if (error.message === "Insufficient balance") {
        throw new BadRequestException(t("insufficientBalance", language));
      }
      throw error;
    }
  }
}