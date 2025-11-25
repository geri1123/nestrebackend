import { Module } from "@nestjs/common";
import { AdvertiseProductController } from "./advertise_product.controller";
import { ProductAdvertisementRepository } from "../../repositories/product_advertisement/product_advertisement.repository";
// import { AdvertiseProductService } from "./advertise_product.service";
import { ProductModule } from "../product/product.module";
import { ProductAdvertisementService } from "./advertise_product.service";
import { WalletModule } from "../wallet/wallet.module";
import { ProductAdvertisementCleanupService } from "./product-advertisement-cleanup.service";

@Module({
    imports:[ProductModule , WalletModule],
    providers:[ProductAdvertisementRepository , ProductAdvertisementService ,ProductAdvertisementCleanupService],
    controllers:[AdvertiseProductController],
    exports:[ProductAdvertisementCleanupService]
})
export class AdvertiseProductModule{}
