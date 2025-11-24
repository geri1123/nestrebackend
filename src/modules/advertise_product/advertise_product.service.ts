import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { ProductAdvertisementRepository } from "../../repositories/product_advertisement/product_advertisement.repository";
import { ProductsRepository } from "../../repositories/product/product.repository";
// import { WalletService } from "../wallet/wallet.service";
import { SupportedLang, t } from "../../locales";
import { advertisement_type, product_status, wallet_transaction_type } from "@prisma/client";
import { AdvertiseDto } from "./dto/advertise.dto";
import { ProductService } from "../product/services/product-service";
import { WalletService } from "../wallet/wallet.service";


const AD_PRICING = {
  cheap: 5,
  normal: 10,
  premium: 20,
};


const AD_DURATION = {
  cheap: 7,
  normal: 14,
  premium: 30,
};

@Injectable()
export class ProductAdvertisementService {
  constructor(
 
    private readonly adRepo: ProductAdvertisementRepository,
    private readonly walletService: WalletService,
    private readonly productService:ProductService,
        private readonly prisma: PrismaService
  ) {}
private async validateAdvertise(productId: number, userId: number, language: SupportedLang) {
    const product = await this.productService.findProductById(productId, language);

    if (product?.userId !== userId) throw new ForbiddenException(t("noPermissionToAdvertise", language));
    if (product?.status !== "active") throw new BadRequestException(t("productNotActive", language));

    const existingAd = await this.adRepo.getActiveAd(productId);
    if (existingAd) throw new BadRequestException(t("productAlreadyAdvertised", language));

    return product;
  }

  async advertise(data: AdvertiseDto, userId: number, language: SupportedLang) {
  const product = await this.validateAdvertise(data.productId, userId, language);

  const adPrice = AD_PRICING[data.adType || "normal"];
  const endDate = new Date(Date.now() + (AD_DURATION[data.adType || "normal"] * 24 * 60 * 60 * 1000));

  return this.prisma.$transaction(async (tx) => {

    // Deduct wallet and get transaction ID
    const { transactionId } = await this.walletService.changeWalletBalance(
      userId,
      wallet_transaction_type.purchase,
      adPrice,
      language,
      tx
    );

    // Create advertisement with walletTxId
    const ad = await this.adRepo.createAdvertisementTx(
      tx,
      product.id,
      userId,
      data.adType,
      new Date(),
      endDate,
      transactionId  // <-- store wallet transaction
    );

    return ad;
  });
}
}