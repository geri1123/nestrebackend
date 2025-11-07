// products/search-products.controller.ts
import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, Req, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { SearchProductsService } from './search-product.service';
import { t, type SupportedLang } from '../../locales';
import { SearchFiltersDto } from './dto/product-filters.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ProductsSearchResponseDto } from './dto/product-frontend.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import type { RequestWithUser } from '../../common/types/request-with-user.interface';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../common/helpers/validation.helper';
import { LanguageCode } from '@prisma/client';
import { CreateProductService } from './create-product.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductService } from './update-product.service';

@Controller('products')
export class SearchProductsController {
  constructor(
    private readonly searchProductsService: SearchProductsService,
    private readonly createproductService: CreateProductService,
    private readonly updateProductService:UpdateProductService
  ) {}
 

@Public()
  @Get('search')

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

  
    @Post("add")
  @UseInterceptors(FilesInterceptor('images', 7)) 
  async createProduct(
    @Body()  body: Record<string, any>,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req:RequestWithUser
  ) {
   const language =req.language;
   const userId=req.userId;
   const agencyId=req.agencyId;
   if (!userId) {
      throw new BadRequestException(t('userNotAuthenticated', req.language));
    }
 const dto = plainToInstance(CreateProductDto, body);
const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);
   return this.createproductService.createProduct(dto ,images , language ,userId , agencyId);
  }


@Patch('update/:id')
@UseInterceptors(FilesInterceptor('images', 7))
async updateProduct(
  @Param('id') id: string,
  @Body() body: Record<string, any>,
  @UploadedFiles() images: Express.Multer.File[],
  @Req() req: RequestWithUser
) {
  const language = req.language;
  const userId = req.userId;
const agencyId=req.agencyId;
  if (!userId) {
    throw new BadRequestException(t('userNotAuthenticated', language));
  }

  const dto = plainToInstance(UpdateProductDto, body);
  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);

  return this.updateProductService.updateProduct(
    Number(id),
    dto,
    userId,
    agencyId,
    language,
    images, // pass uploaded files here
  );
}

}
