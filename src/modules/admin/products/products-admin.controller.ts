import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { SearchProductsUseCase } from "../../product/application/use-cases/search-products.use-case";
import { SearchFiltersHelper } from "../../product/application/helpers/search-filters.helper";
@Public()
@Controller('admin/products')

export class ProductsAdminController{
    constructor(
            private readonly searchFiltersHelper: SearchFiltersHelper,
        
        private readonly searchProductsUseCase:SearchProductsUseCase){}
    @UseGuards(AdminJwtGuard)

    @Get()
    async get(
        @Query() rawQuery: Record<string, any>,
        @Query('page') page = '1'
    ){
        const filters = this.searchFiltersHelper.parse(rawQuery, page);
        return this.searchProductsUseCase.execute(filters, "al",true);

    }
}