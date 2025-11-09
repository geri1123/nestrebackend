// products/search-products.controller.ts
import {  Controller, Get,  NotFoundException,  Param,  Query, Req, UseGuards} from '@nestjs/common';
import { SearchProductsService } from '../services/search-product.service';
import {  type SupportedLang } from '../../../locales';
import { Public } from '../../../common/decorators/public.decorator';
import { ProductsSearchResponseDto } from '../dto/product-frontend.dto';

import { SearchFiltersHelper } from '../utils/search-filters.helper';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { RequestWithLang } from '../../../middlewares/language.middleware';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { userInfo } from 'os';
import { ProductService } from '../services/product-service';
@Controller('products')
export class SearchProductsController {
  constructor(
    private readonly searchProductsService: SearchProductsService,
    private readonly searchfilter:SearchFiltersHelper,
    private readonly productService:ProductService
  ) {}
 

@Public()
  @Get('search')

  async searchAll(
    @Req() req:RequestWithLang,
    @Query() rawQuery: Record<string, any>,
    @Query('page') page = '1',
    // @Query('lang') lang: SupportedLang = 'al'
  ): Promise<ProductsSearchResponseDto> {
    const language=req.language;
    const filters = this.searchfilter.parse(rawQuery, page);
    console.log('Controller parsed filters:', JSON.stringify(filters, null, 2));

    return this.searchProductsService.getProducts(filters, language, false );
  }

  
@Get("dashboard/products")
async getDashboardProducts(
  @Req() req: RequestWithUser, 
  @Query() rawQuery: Record<string, any>,
  @Query('page') page = '1',
  @Query('view') view: 'mine' | 'agency' = 'mine' 
): Promise<ProductsSearchResponseDto> {
   const language = req.language;
  const filters = this.searchfilter.parse(rawQuery, page , );

  if (view === 'mine') {
   
    filters.userId = req.userId;
    // filters.status = undefined; 
  } else if (view === 'agency') {
    filters.agencyId = req.agencyId!;

    if (req.user.role === 'agent' && !req.agentPermissions?.can_view_all_posts) {
      
      filters.status = 'active';
    } 
    else if (rawQuery.status) {
      filters.status = rawQuery.status; 
    }
  }

 
  const isProtectedRoute =
    view === 'mine' || 
    (view === 'agency' && (req.user.role === 'agency_owner' || req.agentPermissions?.can_view_all_posts));

  return this.searchProductsService.getProducts(filters, language, isProtectedRoute);
}


@Get(":id")
async getProduct(@Param('id') id: number,  @Req() req: RequestWithLang, ) {
 const language=req.language;
  const product = await this.productService.getSingleProduct(id,language );
  if (!product) {
    throw new NotFoundException('Product not found');
  }
  return product;
}

}






