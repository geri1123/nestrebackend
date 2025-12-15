
import { Controller, Get, Query, Param, Req, NotFoundException } from '@nestjs/common';
import { SearchProductsUseCase } from '../application/use-cases/search-products.use-case';
import { GetProductByIdUseCase } from '../application/use-cases/get-product-by-id.use-case';
import { SearchFiltersHelper } from '../application/helpers/search-filters.helper';
import { Public } from '../../../common/decorators/public.decorator';
import { ProductsSearchResponseDto } from '../dto/product-frontend.dto';
import { t } from '../../../locales';
import type { RequestWithLang } from '../../../middlewares/language.middleware';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { ProductClicksService } from '../../product-clicks/product-clicks.service';
import { SoftAuthService } from '../../../common/soft-auth/soft-auth.service';
import { product_status } from '@prisma/client';

@Controller('products')
export class SearchProductsController {
  constructor(
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly searchFiltersHelper: SearchFiltersHelper,
    private readonly productClicksService: ProductClicksService,
    private readonly softAuth: SoftAuthService
  ) {}

  @Public()
  @Get('search')
  async searchAll(
    @Req() req: RequestWithLang,
    @Query() rawQuery: Record<string, any>,
    @Query('page') page = '1'
  ): Promise<ProductsSearchResponseDto> {
    const language = req.language;
    const filters = this.searchFiltersHelper.parse(rawQuery, page);

    return this.searchProductsUseCase.execute(filters, language, false);
  }

  @Public()
  @Get('agency/:agencyId')
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
  async getProtectedProduct(@Param('id') id: number, @Req() req: RequestWithUser) {
    const product = await this.getProductByIdUseCase.execute(id, req.language, true, req);
    if (!product) throw new NotFoundException(t('productNotFound', req.language));

    return product;
  }
}