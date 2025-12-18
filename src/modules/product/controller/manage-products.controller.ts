import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
import { SearchProductsUseCase } from '../application/use-cases/search-products.use-case';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductsSearchResponseDto } from '../dto/product-frontend.dto';
import { SearchFiltersHelper } from '../application/helpers/search-filters.helper';
import { t } from '../../../locales';
import { throwValidationErrors } from '../../../common/helpers/validation.helper';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { ProductOwnershipAndPermissionGuard } from '../../../common/guard/product-ownership.guard';
import { UserStatusGuard } from '../../../common/guard/status.guard';
import { ApiCreateProduct } from '../decorators/create-product.decorator';
import { ApiDashboardProducts } from '../decorators/dashboard-products.decorator';
import { ApiUpdateProduct } from '../decorators/update-product.decorator';

@Controller('products')
export class ManageProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly searchFiltersHelper: SearchFiltersHelper
  ) {}

  @UseGuards(UserStatusGuard)
  @Post('add')
  @ApiCreateProduct()
  @UseInterceptors(FilesInterceptor('images', 7))
  async createProduct(
    @Body() body: Record<string, any>,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req: RequestWithUser
  ) {
    const language = req.language;
    const userId = req.userId;
    const agencyId = req.agencyId;

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    if (req.user?.role !== 'user' && !req.agencyId) {
      throw new ForbiddenException(t('userNotAssociatedWithAgency', req.language));
    }

    const dto = plainToInstance(CreateProductDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);

    return this.createProductUseCase.execute(dto, images, language, userId, agencyId!);
  }

  @UseGuards(ProductOwnershipAndPermissionGuard, UserStatusGuard)
  @Patch('update/:id')
  @ApiUpdateProduct()
  @UseInterceptors(FilesInterceptor('images', 7))
  async updateProduct(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
        // @Body() dto:UpdateProductDto,

    @UploadedFiles() images: Express.Multer.File[],
    @Req() req: RequestWithUser
  ) {
    const language = req.language;
    const userId = req.userId;
    const agencyId = req.agencyId;

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }

    const dto = plainToInstance(UpdateProductDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);

    return this.updateProductUseCase.execute(
      Number(id),
      dto,
      userId,
      agencyId!,
      language,
      images
    );
  }

  @Get('dashboard/products')
  @ApiDashboardProducts()
  async getDashboardProducts(
    @Req() req: RequestWithUser,
    @Query() rawQuery: Record<string, any>,
    @Query('page') page = '1',
    @Query('view') view: 'mine' | 'agency' = 'mine'
  ): Promise<ProductsSearchResponseDto> {
    const language = req.language;
    const filters = this.searchFiltersHelper.parse(rawQuery, page);

    if (view === 'mine') {
      // Show only your own products
      filters.userId = req.userId;
    } else if (view === 'agency') {
      if (!req.agencyId || (req.user?.role !== 'agent' && req.user?.role !== 'agency_owner')) {
        throw new ForbiddenException(t('userNotAssociatedWithAgency', language));
      }

      filters.agencyId = req.agencyId;

      if (req.user.role === 'agent' && !req.agentPermissions?.canViewAllPosts) {
        filters.status = 'active';
      } else if (rawQuery.status) {
        filters.status = rawQuery.status;
      }
    }

    // Determine if route is "protected"
    const isProtectedRoute =
      view === 'mine' ||
      (view === 'agency' &&
        (req.user?.role === 'agency_owner' || req.agentPermissions?.canViewAllPosts));

    return this.searchProductsUseCase.execute(filters, language, isProtectedRoute);
  }
}