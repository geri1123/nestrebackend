import { Controller, Get, HttpCode, HttpStatus, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FiltersService } from './filters.service';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { Public } from '../../common/decorators/public.decorator';
import { ApiGetAttributes, ApiGetCities, ApiGetCountries, ApiGetFilters } from './decorators/filters-swagger.decorators';

@ApiTags('Filters')
@Controller('filters')

@Public()

export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}
@ApiGetFilters()
  @Get()
  @HttpCode(HttpStatus.OK)
 
  async getFilters(@Req() req: RequestWithLang) {
    const lang = req.language;
    const productsStatus = 'active';
    const filters = await this.filtersService.getFilters(lang, productsStatus);
    return { success: true, ...filters };
  }


  @ApiGetAttributes()
  @Get('attributes/:subcategoryId')
  @HttpCode(HttpStatus.OK)
  async getAttributes(
    @Param('subcategoryId') subcategoryId: string,
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';
    const id = Number(subcategoryId);
    
    if (isNaN(id) || id <= 0) {
      return { success: false, attributes: [] };
    }

    const attributes = await this.filtersService.getAttributes(id, lang);
    return { success: true, attributes };
  }
@ApiGetCountries()
  @Get('countries')
  @HttpCode(HttpStatus.OK)
  async getCountries() {
    const countries = await this.filtersService.getCountries();
    return { success: true, countries };
  }
@ApiGetCities()
  @Get('cities/:countryCode')
  @HttpCode(HttpStatus.OK)
  async getCities(@Param('countryCode') countryCode: string) {
    const cities = await this.filtersService.getCities(countryCode);
    return { success: true, cities };
  }
}
