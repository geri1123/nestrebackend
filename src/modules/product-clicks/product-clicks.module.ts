import { Module } from "@nestjs/common";
import { ProductClick, ProductClickSchema } from "./schemas/product_clicks.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductClicksService } from "./product-clicks.service";


@Module({
controllers:[],
providers:[ProductClicksService],
  imports: [
    MongooseModule.forFeature([{ name: ProductClick.name, schema: ProductClickSchema }]),
  ],

 exports:[ProductClicksService],
})
export class ProductClicksModule{};