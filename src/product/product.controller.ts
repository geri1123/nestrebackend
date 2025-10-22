import { Controller, Get, Query, Param } from '@nestjs/common';
import { SearchProductsService , ProductFrontend} from './search-product.service';
import { SupportedLang } from '../locales';
import { SearchFiltersDto } from './dto/product-filters.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('products')
export class SearchProductsController {
  constructor(private readonly searchProductsService: SearchProductsService) {}
@Public()
 @Get('search/:category/:subcategory')
async getProductsBySearch(
  @Param('category') categorySlug?: string,
  @Param('subcategory') subcategorySlug?: string,
  @Query() query?: any
 
  ) {
    const language: SupportedLang = query.lang || 'al';

    const {
      pricelow,
      pricehigh,
      areaLow,
      areaHigh,
      city,
      country,
      listingtype,
      sortBy,
      page = '1',
      ...attributeFilters
    } = query || {};

    const FIXED_LIMIT = 12;
    const pageValue = Math.max(1, parseInt(page as string, 10) || 1);
    const offsetValue = (pageValue - 1) * FIXED_LIMIT;

    // Parse cities
    let cities: string[] | undefined;
    if (city) {
      cities = Array.isArray(city)
        ? city.map(c => String(c).toLowerCase())
        : String(city).split(',').map(c => c.trim().toLowerCase());
    }

    // Parse attributes
    const parsedAttributes: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(attributeFilters)) {
      if (!value) continue;
      if (Array.isArray(value)) parsedAttributes[key] = value.map(v => String(v).toLowerCase());
      else if (typeof value === 'string' && value.includes(','))
        parsedAttributes[key] = value.split(',').map(v => v.trim().toLowerCase());
      else parsedAttributes[key] = [String(value).toLowerCase()];
    }

    const filters: SearchFiltersDto = {
      categorySlug,
      subcategorySlug,
      pricelow: pricelow ? parseFloat(pricelow as string) : undefined,
      pricehigh: pricehigh ? parseFloat(pricehigh as string) : undefined,
      areaLow: areaLow ? parseFloat(areaLow as string) : undefined,
      areaHigh: areaHigh ? parseFloat(areaHigh as string) : undefined,
      cities,
      country: country ? (country as string) : undefined,
      listingtype: listingtype ? (listingtype as string) : undefined,
      attributes: parsedAttributes,
      status: 'active',
      sortBy: sortBy ? (sortBy as 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc') : undefined,
      limit: FIXED_LIMIT,
      offset: offsetValue,
    };

    const result = await this.searchProductsService.getProducts(filters, language);

    return {
      success: true,
      data: {
        ...result,
        filters: {
          ...filters,
          parsedPage: pageValue,
          calculatedOffset: offsetValue,
        },
      },
    };
  }
}
