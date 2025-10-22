import { Module } from "@nestjs/common";
import { SearchProductsRepo } from "../repositories/product/search-product.repository";
import { SearchProductsService } from "./search-product.service";
import { SearchProductsController } from "./product.controller";

@Module({
    
    imports:[],
    controllers:[SearchProductsController],
    providers:[SearchProductsRepo  , SearchProductsService],

})
export class ProductModule{}