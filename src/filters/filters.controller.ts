import { Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { FiltersService } from './filters.service';
import type { SupportedLang } from '../locales';
import { FiltersResponseSwaggerDto } from './dto/filters.dto';
import { ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttributesResponseDto } from './dto/attribute.dto';
import { CityDtoResponse, countryResponseDto } from './dto/location.dto';
import { Public } from '../common/decorators/public.decorator';
@Controller('filters')
@Public()
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

 @Get()
 
@HttpCode(HttpStatus.OK) // explicitly sets status code
@ApiOkResponse({ description: 'Filters fetched', type: FiltersResponseSwaggerDto })
async getFilters(@Query('lang') lang: SupportedLang = 'al') {
  const productsStatus = 'active';
  const filters = await this.filtersService.getFilters(lang, productsStatus);
  return { success: true, ...filters };
}

  @Get('attributes/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Attributes fetched', type: AttributesResponseDto })
  @ApiParam({ name: 'subcategoryId', type: Number, description: 'ID of the subcategory' })
  @ApiQuery({ name: 'lang', required: false, description: 'Language code', example: 'al' })
  async getAttributes(
    @Param('subcategoryId') subcategoryId: string,
    @Query('lang') lang: SupportedLang = 'al',
  ) {
    const id = Number(subcategoryId);
    if (isNaN(id) || id <= 0) {
      return { success: false, attributes: [] };
    }

    const attributes = await this.filtersService.getAttributes(id, lang);

    return { success: true, attributes };
  }

   @Get('countries')
   @HttpCode(HttpStatus.OK)
   @ApiOkResponse({description:'Country Fetched' , type:countryResponseDto})
  async getCountries() {
    const countries = await this.filtersService.getCountries();
    return { success: true, countries };
  }

  @Get('cities/:countryCode')   
  @HttpCode(HttpStatus.OK)
  @ApiParam({ 
  name: 'countryCode', 
  type: String,
  description: 'Country code, e.g., "al", "it"' 
})
@ApiOkResponse({description:"Cities fetched", type:CityDtoResponse})

  async getCities(@Param('countryCode') countryCode: string) {
    const cities = await this.filtersService.getCities(countryCode);
    return { success: true, cities };
  }
}