import { Module } from "@nestjs/common";
import { ProductsAdminController } from "./products-admin.controller";
import { AdminAuthModule } from "../auth/admin-auth.module";
import { ProductModule } from "../../product/product.module";

@Module({
    imports:[AdminAuthModule , ProductModule ],
    controllers:[ProductsAdminController],

})
export class ProductsAdminModule{}