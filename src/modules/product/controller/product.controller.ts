
import { Controller, Get, Query, Param, Req, NotFoundException } from '@nestjs/common';
import { SearchProductsUseCase } from '../application/use-cases/search-products.use-case';
import { GetProductByIdUseCase } from '../application/use-cases/get-product-by-id.use-case';
import { SearchFiltersHelper } from '../application/helpers/search-filters.helper';
import { Public } from '../../../common/decorators/public.decorator';
import { t } from '../../../locales';
import type { RequestWithLang } from '../../../middlewares/language.middleware';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { ProductClicksService } from '../../product-clicks/product-clicks.service';
import { SoftAuthService } from '../../../common/soft-auth/soft-auth.service';
import { product_status } from '@prisma/client';
import { ApiSearchAgencyProducts, ApiSearchAgentProducts, ApiSearchProducts } from '../decorators/search-product.decorator';
import { ApiGetProtectedProduct, ApiGetPublicProduct } from '../decorators/product-detail.decorator';
import { SearchFiltersDto } from '../dto/product-filters.dto';
import { GetMostClickedProductsUseCase } from '../application/use-cases/get-most-clicked-products.use-case';
import { ApiProductsMostClickResponse } from '../decorators/most-clicks.decorator';
import { GetRelatedProductsUseCase } from '../application/use-cases/get-related.use-case';
import { ApiGetRelatedProducts } from '../decorators/related-products.decorator';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Products')
@Controller('products')
export class SearchProductsController {
  constructor(
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly searchFiltersHelper: SearchFiltersHelper,
    private readonly productClicksService: ProductClicksService,
    private readonly getMostClickedProductsUseCase: GetMostClickedProductsUseCase,
    private readonly getRelatedProductsUseCase: GetRelatedProductsUseCase,
    private readonly softAuth: SoftAuthService
  ) {}

  @Public()
  @Get('search')
  @ApiSearchProducts()
  async searchAll(
    @Req() req: RequestWithLang,
    @Query() rawQuery: Record<string, any>,
    @Query('page') page = '1'
  ) {
    const language = req.language;
     console.log(" RAW QUERY RECEIVED:", rawQuery);
  console.log("PAGE:", page);
  console.log(" LANGUAGE:", req.language);
    const filters = this.searchFiltersHelper.parse(rawQuery, page);
  console.log(" FILTERS AFTER PARSE:", filters);
    return this.searchProductsUseCase.execute(filters, language, false);
  }

  @Public()
  @Get('agency/:agencyId')
  @ApiSearchAgencyProducts()
  async getAgencyProducts(
    @Param('agencyId') agencyId: number,
    @Req() req: RequestWithLang,
    @Query('page') page = '1'
  ) {
    const language = req.language;
    const filters = this.searchFiltersHelper.parse(req.query, page);

    filters.agencyId = agencyId;
    filters.status = 'active';

    return this.searchProductsUseCase.execute(filters, language, false);
  }

  @Public()
  @Get('agent/:agentId')
  @ApiSearchAgentProducts()
  async getAgentProducts(
    @Param('agentId') agentId: number,
    @Req() req: RequestWithLang,
    @Query('page') page = '1'
  ) {
    const language = req.language;
    const filters = this.searchFiltersHelper.parse(req.query, page);

    filters.userId = agentId;
    filters.status = product_status.active;

    return this.searchProductsUseCase.execute(filters, language, false);
  }

  @Public()
  @Get('public/:id')
@ApiGetPublicProduct()
  async getPublicProduct(@Param('id') id: number, @Req() req: RequestWithUser) {
    await this.softAuth.attachUserIfExists(req);
    
    const product = await this.getProductByIdUseCase.execute(id, req.language, false);
    if (!product) throw new NotFoundException(t('productNotFound', req.language));

    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.ip ||
      'unknown';

    await this.productClicksService.incrementClick(
      `${id}`,
      `${req.userId || 'guest'}`,
      ip
    );

    return product;
  }

  @Get('protected/:id')
  @ApiGetProtectedProduct()
  async getProtectedProduct(@Param('id') id: number, @Req() req: RequestWithUser) {
    const product = await this.getProductByIdUseCase.execute(id, req.language, true, req);
    if (!product) throw new NotFoundException(t('productNotFound', req.language));

    return product;
  }
   @Public()
  @Get('most-clicks')
  @ApiProductsMostClickResponse()
  async getMostClicksProducts(
    @Req() req: RequestWithLang,
    @Query('limit') limit = '12'
  ) {
    const language = req.language;
    const limitValue = Math.min(Math.max(1, parseInt(limit, 10) || 12), 100);

    const products = await this.getMostClickedProductsUseCase.execute(
      limitValue,
      language
    );

    return { products };
  }

  @Public()
@Get('public/:id/related')
  @ApiGetRelatedProducts()
async getRelatedProducts(
  @Param('id') id: number,
  @Req() req: RequestWithLang,
  @Query('limit') limit = '4',
) {
  const language = req.language;
  const limitValue = Math.min(Math.max(1, parseInt(limit, 10) || 6), 12);

  const productResult = await this.getProductByIdUseCase.execute(
    id,
    language,
    false,
  );

  if (!productResult.product || !productResult.relatedData) {
    return { products: [] };
  }

  const relatedProducts = await this.getRelatedProductsUseCase.execute(
    id,
    productResult.relatedData.subcategoryId,
    productResult.relatedData.categoryId,
    language,
    limitValue,
  );

  return { products: relatedProducts };
}
}