// products/search-products.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchProductsService } from './search-product.service';
import type { SupportedLang } from '../locales';
import { SearchFiltersDto } from './dto/product-filters.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiTags, ApiOkResponse, ApiQuery, ApiOperation, ApiExtraModels } from '@nestjs/swagger';
import { ProductsSearchResponseDto } from './dto/product-frontend.dto';
import { ApiSearchFilters } from '../common/decorators/api-search-filters.decorator';

@ApiTags('products')
@Controller('products')
@Public()
export class SearchProductsController {
  constructor(private readonly searchProductsService: SearchProductsService) {}
 @ApiOperation({
    summary: 'Search and filter products',
    description: 'Search products with various filters including category, price range, attributes, location, and more.',
  })
  @ApiOkResponse({
    type: ProductsSearchResponseDto,
    description: 'Returns paginated list of products matching the search criteria',
  })
  @ApiSearchFilters()
 @ApiExtraModels(SearchFiltersDto)
  @Get('search')
  @ApiOkResponse({ type: ProductsSearchResponseDto })
  async searchAll(
    @Query() rawQuery: Record<string, any>,
    @Query('page') page = '1',
    @Query('lang') lang: SupportedLang = 'al'
  ): Promise<ProductsSearchResponseDto> {
    const FIXED_LIMIT = 12;
    const pageValue = Math.max(1, parseInt(page, 10) || 1);
    const offsetValue = (pageValue - 1) * FIXED_LIMIT;

    // Parse attributes from query params like attributes[1]=4,5 or attributes[1]=4&attributes[1]=5
    const attributes: Record<number, number[]> = {};
    for (const key in rawQuery) {
      const match = key.match(/^attributes\[(\d+)\]$/);
      if (match) {
        const attrId = Number(match[1]);
        const value = rawQuery[key];
        
        if (Array.isArray(value)) {
          // Handle array: attributes[1]=4&attributes[1]=5
          attributes[attrId] = value.flatMap(v => 
            String(v).split(',').map(num => Number(num.trim()))
          );
        } else {
          // Handle comma-separated: attributes[1]=4,5
          attributes[attrId] = String(value).split(',').map(v => Number(v.trim()));
        }
      }
    }

    // Parse cities - can be comma-separated or array: cities=tirana,durres or cities=tirana&cities=durres
    let cities: string[] | undefined = undefined;
    if (rawQuery.cities) {
      if (Array.isArray(rawQuery.cities)) {
        cities = rawQuery.cities.flatMap(city => 
          String(city).split(',').map(c => c.trim())
        );
      } else {
        cities = String(rawQuery.cities).split(',').map(c => c.trim());
      }
    }

    // Build filters object with proper type conversions
    const filters: SearchFiltersDto = {
      categoryId: rawQuery.categoryId ? Number(rawQuery.categoryId) : undefined,
      subcategoryId: rawQuery.subcategoryId ? Number(rawQuery.subcategoryId) : undefined,
      listingTypeId: rawQuery.listingTypeId ? Number(rawQuery.listingTypeId) : undefined,
      pricelow: rawQuery.pricelow ? Number(rawQuery.pricelow) : undefined,
      pricehigh: rawQuery.pricehigh ? Number(rawQuery.pricehigh) : undefined,
      areaLow: rawQuery.areaLow ? Number(rawQuery.areaLow) : undefined,
      areaHigh: rawQuery.areaHigh ? Number(rawQuery.areaHigh) : undefined,
      cities,
      country: rawQuery.country,
      sortBy: rawQuery.sortBy as SearchFiltersDto['sortBy'],
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
      status: 'active',
      limit: FIXED_LIMIT,
      offset: offsetValue,
    };

    console.log('Controller parsed filters:', JSON.stringify(filters, null, 2));

    return this.searchProductsService.getProducts(filters, lang);
  }
}
