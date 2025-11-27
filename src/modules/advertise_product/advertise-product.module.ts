import { Module } from "@nestjs/common";
import { AdvertiseProductController } from "./advertise-product.controller";
import { ProductAdvertisementRepository } from "../../repositories/product_advertisement/product_advertisement.repository";
// import { AdvertiseProductService } from "./advertise_product.service";
import { ProductModule } from "../product/product.module";
import { ProductAdvertisementService } from "./advertise-product.service";
import { WalletModule } from "../wallet/wallet.module";
import { ProductAdvertisementCleanupService } from "./product-advertisement-cleanup.service";
import { AdvertiseProductUseCase } from "./use-cases/advertise-product.use-case";
import { ExpireProductAdsUseCase } from "./use-cases/expired-addvertisement.use-cace";

@Module({
    imports:[ProductModule , WalletModule],
    providers:[
        {
    provide: "IProductAdvertisementRepository",
    useClass: ProductAdvertisementRepository,
  },
        
        ExpireProductAdsUseCase,AdvertiseProductUseCase, 
        ProductAdvertisementService ,ProductAdvertisementCleanupService],
    controllers:[AdvertiseProductController],
    exports:[ProductAdvertisementCleanupService]
})
export class AdvertiseProductModule{}
