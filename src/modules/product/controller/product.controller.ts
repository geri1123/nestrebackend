// products/search-products.controller.ts
import {  Controller, Get,  Query, Req, UseGuards} from '@nestjs/common';
import { SearchProductsService } from '../services/search-product.service';
import {  type SupportedLang } from '../../../locales';
import { Public } from '../../../common/decorators/public.decorator';
import { ProductsSearchResponseDto } from '../dto/product-frontend.dto';

import { SearchFiltersHelper } from '../utils/search-filters.helper';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import type { RequestWithLang } from '../../../middlewares/language.middleware';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { userInfo } from 'os';
@Controller('products')
export class SearchProductsController {
  constructor(
    private readonly searchProductsService: SearchProductsService,
    private readonly searchfilter:SearchFiltersHelper
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
      filters.status = rawQuery.status; // owner or privileged agent can filter by status
    }
  }

 
  const isProtectedRoute =
    view === 'mine' || 
    (view === 'agency' && (req.user.role === 'agency_owner' || req.agentPermissions?.can_view_all_posts));

  return this.searchProductsService.getProducts(filters, language, isProtectedRoute);
}

}








// const FIXED_LIMIT = 12;
    // const pageValue = Math.max(1, parseInt(page, 10) || 1);
    // const offsetValue = (pageValue - 1) * FIXED_LIMIT;

    // // attributes[1]=4,5 or attributes[1]=4&attributes[1]=5
    // const attributes: Record<number, number[]> = {};
    // for (const key in rawQuery) {
    //   const match = key.match(/^attributes\[(\d+)\]$/);
    //   if (match) {
    //     const attrId = Number(match[1]);
    //     const value = rawQuery[key];
        
    //     if (Array.isArray(value)) {
    //       //  attributes[1]=4&attributes[1]=5
    //       attributes[attrId] = value.flatMap(v => 
    //         String(v).split(',').map(num => Number(num.trim()))
    //       );
    //     } else {
    //       //  attributes[1]=4,5
    //       attributes[attrId] = String(value).split(',').map(v => Number(v.trim()));
    //     }
    //   }
    // }

    // // Parse cities 
    // let cities: string[] | undefined = undefined;
    // if (rawQuery.cities) {
    //   if (Array.isArray(rawQuery.cities)) {
    //     cities = rawQuery.cities.flatMap(city => 
    //       String(city).split(',').map(c => c.trim())
    //     );
    //   } else {
    //     cities = String(rawQuery.cities).split(',').map(c => c.trim());
    //   }
    // }

    // // Build filters 
    // const filters: SearchFiltersDto = {
    //   categoryId: rawQuery.categoryId ? Number(rawQuery.categoryId) : undefined,
    //   subcategoryId: rawQuery.subcategoryId ? Number(rawQuery.subcategoryId) : undefined,
    //   listingTypeId: rawQuery.listingTypeId ? Number(rawQuery.listingTypeId) : undefined,
    //   pricelow: rawQuery.pricelow ? Number(rawQuery.pricelow) : undefined,
    //   pricehigh: rawQuery.pricehigh ? Number(rawQuery.pricehigh) : undefined,
    //   areaLow: rawQuery.areaLow ? Number(rawQuery.areaLow) : undefined,
    //   areaHigh: rawQuery.areaHigh ? Number(rawQuery.areaHigh) : undefined,
    //   cities,
    //   country: rawQuery.country,
    //   sortBy: rawQuery.sortBy as SearchFiltersDto['sortBy'],
    //   attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    //   // status: 'active',
    //   limit: FIXED_LIMIT,
    //   offset: offsetValue,
    // };