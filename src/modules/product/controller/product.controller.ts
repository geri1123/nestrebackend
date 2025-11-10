// products/search-products.controller.ts
import {  Controller, Get,  NotFoundException,  Param,  Query, Req, UseGuards} from '@nestjs/common';
import { SearchProductsService } from '../services/search-product.service';
import {  t } from '../../../locales';
import { Public } from '../../../common/decorators/public.decorator';
import { ProductsSearchResponseDto } from '../dto/product-frontend.dto';

import { SearchFiltersHelper } from '../utils/search-filters.helper';
import type { RequestWithLang } from '../../../middlewares/language.middleware';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';

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

  
@Public()
@Get(':id')
async getProduct(
  @Param('id') id: number,
  @Req() req: RequestWithUser
) {
  const language = req.language;


  const isProtectedRoute = !!('user' in req && req.user);

  const product = await this.productService.getSingleProduct(id, language, isProtectedRoute, req);

  if (!product) {
    throw new NotFoundException(t('productNotFound', language));
  }

  return product;
}

}






