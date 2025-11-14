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
  
  ): Promise<ProductsSearchResponseDto> {
    const language=req.language;
    const filters = this.searchfilter.parse(rawQuery, page);
   

    return this.searchProductsService.getProducts(filters, language, false );
  }
@Public()
@Get('agency/:agencyId')
async getAgencyProducts(
  @Param('agencyId') agencyId: number,
  @Req() req: RequestWithLang,
  @Query('page') page = '1'
) {
  const language = req.language;
  const filters = this.searchfilter.parse(req.query, page);


  filters.agencyId = agencyId;

 
  filters.status = 'active';

  return this.searchProductsService.getProducts(filters, language, false);
}

@Public()
@Get('agent/:agentId')
async getAgentProducts(
  @Param('agentId') agentId: number,
  @Req() req: RequestWithLang,
  @Query('page') page = '1'
) {
  const language = req.language;
  const filters = this.searchfilter.parse(req.query, page);

  
  filters.userId = agentId;


  filters.status = 'active';

  return this.searchProductsService.getProducts(filters, language, false);
}

  @Public()
@Get('public/:id')
async getPublicProduct(@Param('id') id: number, @Req() req: RequestWithUser) {
  const product = await this.productService.getSingleProduct(id, req.language, false);
  if (!product) throw new NotFoundException(t('productNotFound', req.language));
  return product;
}
  @Get('protected/:id')
async getProtectedProduct(@Param('id') id: number, @Req() req: RequestWithUser) {
  const product = await this.productService.getSingleProduct(id, req.language, true, req);
  if (!product) throw new NotFoundException(t('productNotFound', req.language));
  return product;
}



}






