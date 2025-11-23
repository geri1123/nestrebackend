import { Module } from "@nestjs/common";
import { AdvertiseProductController } from "./advertise_product.controller";
import { ProductAdvertisementRepository } from "../../repositories/product_advertisement/product_advertisement.repository";
// import { AdvertiseProductService } from "./advertise_product.service";
import { ProductModule } from "../product/product.module";

@Module({
    imports:[ProductModule],
    providers:[ProductAdvertisementRepository ],
    controllers:[AdvertiseProductController],
    exports:[]
})
export class AdvertiseProductModule{}
