import { Controller, Get, HttpCode, HttpStatus, Param, Query, Req, UseGuards } from '@nestjs/common';
import { FiltersService } from './filters.service';
import type { SupportedLang } from '../../locales';
import { FiltersResponseSwaggerDto } from './dto/filters.dto';
import { ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AttributesResponseDto } from './dto/attribute.dto';
// import { CityDtoResponse, countryResponseDto } from './dto/location.dto';
import { Public } from '../../common/decorators/public.decorator';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { FiltersSwagger } from './swagger/filters.swager';
@Controller('filters')
@Public()
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}
  
 @Get()
 
@HttpCode(HttpStatus.OK) 
@FiltersSwagger.ApiGetFilters()
async getFilters(@Req() req: RequestWithLang) {
  const lang = req.language;
  const productsStatus = 'active';
  const filters = await this.filtersService.getFilters(lang, productsStatus);
  return { success: true, ...filters };
}

  @Get('attributes/:subcategoryId')
  @HttpCode(HttpStatus.OK)
 @FiltersSwagger.ApiGetAttributes()
  async getAttributes(
    @Param('subcategoryId') subcategoryId: string,
    @Req() req: RequestWithLang,
  ) {
    const lang: SupportedLang = req.language || 'al';
    const id = Number(subcategoryId);
    if (isNaN(id) || id <= 0) {
      return { success: false, attributes: [] };
    }

    const attributes = await this.filtersService.getAttributes(id, lang);

    return { success: true, attributes };
  }

   @Get('countries')
   @HttpCode(HttpStatus.OK)
  @FiltersSwagger.ApiGetCountries()
  async getCountries() {
    const countries = await this.filtersService.getCountries();
    return { success: true, countries };
  }

  @Get('cities/:countryCode')   
  @HttpCode(HttpStatus.OK)
 
 @FiltersSwagger.ApiGetCities()

  async getCities(@Param('countryCode') countryCode: string) {
    const cities = await this.filtersService.getCities(countryCode);
    return { success: true, cities };
  }
}