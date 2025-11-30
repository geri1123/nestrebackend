import { Module } from "@nestjs/common";
import { AdvertiseProductController } from "./controller/advertise-product.controller";
import { ProductAdvertisementRepository } from "../../repositories/product-advertisement/product-advertisement.repository";
// import { AdvertiseProductService } from "./advertise_product.service";
import { ProductModule } from "../product/product.module";
import { WalletModule } from "../wallet/wallet.module";
import { AdvertiseProductUseCase } from "./application/use-cases/advertise-product.use-case";
import { ExpireProductAdsUseCase } from "./application/use-cases/expired-addvertisement.use-cace";


@Module({
    imports:[ProductModule , WalletModule],
    providers:[
        {
    provide: "IProductAdvertisementRepository",
    useClass: ProductAdvertisementRepository,
  },
        
        ExpireProductAdsUseCase,AdvertiseProductUseCase, 
         ],
    controllers:[AdvertiseProductController],
    exports:[ExpireProductAdsUseCase]
})
export class AdvertiseProductModule{}
