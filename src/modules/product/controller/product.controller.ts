// import { SearchProductsUseCase } from '../application/use-cases/search-products.use-case';
// import { GetProductByIdUseCase } from '../application/use-cases/get-product-by-id.use-case';
// import { SearchFiltersHelper } from '../utils/search-filters.helper';
// import { SoftAuthService } from '../../../common/soft-auth/soft-auth.service';
// import { SupportedLang } from '../../../locales';
// @Controller('products')
// export class SearchProductsController {
//   constructor(
//     private readonly searchProductsUseCase: SearchProductsUseCase,
//     private readonly getProductByIdUseCase: GetProductByIdUseCase,
//     private readonly searchFiltersHelper: SearchFiltersHelper
//   ) {}

//   @Get('search')
//   @UseGuards(SoftAuthGuard)
//   async searchProducts(
//     @Query() rawQuery: Record<string, any>,
//     @Query('page') page: string = '1',
//     @Query('language') language: SupportedLang = 'al',
//     @Req() req: RequestWithUser
//   ) {
//     const isProtectedRoute = !!req.userId;
//     const filters = this.searchFiltersHelper.parse(rawQuery, page);
//     return this.searchProductsUseCase.execute(filters, language, isProtectedRoute);
//   }

//   @Get(':id')
//   @UseGuards(SoftAuthGuard)
//   async getProduct(
//     @Param('id') id: string,
//     @Query('language') language: SupportedLang = 'al',
//     @Req() req: RequestWithUser
//   ) {
//     const isProtectedRoute = !!req.userId;
//     return this.getProductByIdUseCase.execute(Number(id), language, isProtectedRoute, req);
//   }
// }

// // modules/product/controller/manage-products.controller.ts
// import {
//   Controller,
//   Post,
//   Put,
//   Body,
//   Param,
//   UseInterceptors,
//   UploadedFiles,
//   Query,
//   UseGuards,
//   Req,
// } from '@nestjs/common';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
// import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
// import { GetProductForPermissionUseCase } from '../application/use-cases/get-product-for-permission.use-case';
// import { CreateProductDto } from '../dto/create-product.dto';
// import { UpdateProductDto } from '../dto/update-product.dto';
// import { SupportedLang } from '../../../locales';
// import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
// import { RequestWithUser } from '../../../common/types/request-with-user.interface';

// @Controller('products')
// @UseGuards(JwtAuthGuard)
// export class ManageProductController {
//   constructor(
//     private readonly createProductUseCase: CreateProductUseCase,
//     private readonly updateProductUseCase: UpdateProductUseCase,
//     private readonly getProductForPermissionUseCase: GetProductForPermissionUseCase
//   ) {}

//   @Post()
//   @UseInterceptors(FilesInterceptor('images', 7))
//   async createProduct(
//     @Body() createProductDto: CreateProductDto,
//     @UploadedFiles() images: Express.Multer.File[],
//     @Query('language') language: SupportedLang = 'al',
//     @Req() req: RequestWithUser
//   ) {
//     return this.createProductUseCase.execute(
//       createProductDto,
//       images,
//       language,
//       req.userId,
//       req.agencyId
//     );
//   }

//   @Put(':id')
//   @UseInterceptors(FilesInterceptor('images', 7))
//   async updateProduct(
//     @Param('id') id: string,
//     @Body() updateProductDto: UpdateProductDto,
//     @UploadedFiles() images: Express.Multer.File[],
//     @Query('language') language: SupportedLang = 'al',
//     @Req() req: RequestWithUser
//   ) {
//     // Permission check
//     await this.getProductForPermissionUseCase.execute(Number(id), language);

//     return this.updateProductUseCase.execute(
//       Number(id),
//       updateProductDto,
//       req.userId,
//       req.agencyId,
//       language,
//       images
//     );
//   }
// }
// // products/search-products.controller.ts
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