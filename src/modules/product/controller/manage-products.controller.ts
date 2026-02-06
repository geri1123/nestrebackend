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
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
import { SearchProductsUseCase } from '../application/use-cases/search-products.use-case';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SearchFiltersHelper } from '../application/helpers/search-filters.helper';
import { t } from '../../../locales';
import { throwValidationErrors } from '../../../common/helpers/validation.helper';
import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { ProductOwnershipGuard } from '../../../infrastructure/auth/guard/product-ownership.guard';
import { ApiCreateProduct } from '../decorators/create-product.decorator';
import { ApiDashboardProducts } from '../decorators/dashboard-products.decorator';
import { ApiUpdateProduct } from '../decorators/update-product.decorator';
import { RequireAgencyContext } from '../../../common/decorators/require-agency-context.decorator';
import { AgencyContextGuard } from '../../../infrastructure/auth/guard/agency-context.guard';
import { PermissionsGuard } from '../../../infrastructure/auth/guard/permissions.guard';
import { permission } from 'node:process';
import { Permissions } from '../../../common/decorators/permissions.decorator';

type MulterFile = Express.Multer.File;

@ApiTags('Products')
@Controller('products')
export class ManageProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly searchFiltersHelper: SearchFiltersHelper
  ) {}
@RequireAgencyContext()
@UseGuards(AgencyContextGuard)
  @Post('add')
  @ApiCreateProduct()
  @UseInterceptors(FilesInterceptor('images', 7))
  async createProduct(
    @Body() body: Record<string, any>,
    @UploadedFiles() images: MulterFile[],
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

    @RequireAgencyContext()

  @UseGuards(AgencyContextGuard, ProductOwnershipGuard)
  @Patch('update/:id')
  @ApiUpdateProduct()
  @UseInterceptors(FilesInterceptor('images', 7))
  async updateProduct(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @UploadedFiles() images: MulterFile[],
    @Req() req: RequestWithUser
  ) {
    const language = req.language;
    const userId = req.userId;

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }

    const dto = plainToInstance(UpdateProductDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);

    return this.updateProductUseCase.execute({
      productId: Number(id),
      dto,
      userId,
      language,
      images,
    });
  }
@RequireAgencyContext()
@UseGuards(AgencyContextGuard)
  @Get('dashboard/products')
  @ApiDashboardProducts()
  async getDashboardProducts(
    @Req() req: RequestWithUser,
    @Query() rawQuery: Record<string, any>,
    @Query('page') page = '1',
    @Query('view') view: 'mine' | 'agency' = 'mine'
  ) {
    const language = req.language;
    const filters = this.searchFiltersHelper.parse(rawQuery, page);

    if (view === 'mine') {
      filters.userId = req.userId;
    } else if (view === 'agency') {
      if (!req.agencyId || (req.user?.role !== 'agent' && req.user?.role !== 'agency_owner')) {
        throw new ForbiddenException(t('userNotAssociatedWithAgency', language));
      }

      filters.agencyId = req.agencyId;

      if (req.user.role === 'agent' && !req.agentPermissions?.can_view_all_posts) {
        filters.status = 'active';
      } else if (rawQuery.status) {
        filters.status = rawQuery.status;
      }
    }

    const isProtectedRoute =
      view === 'mine' ||
      (view === 'agency' &&
        (req.user?.role === 'agency_owner' || req.agentPermissions?.can_view_all_posts));

    return this.searchProductsUseCase.execute(filters, language, isProtectedRoute);
  }
}