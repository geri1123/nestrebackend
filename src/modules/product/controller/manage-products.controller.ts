import {  Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UpdateProductService } from "../services/update-product.service";
import { CreateProductService } from "../services/create-product.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Permissions } from "../../../common/decorators/permissions.decorator";
import { ProductOwnershipAndPermissionGuard } from "../../../common/guard/product-ownership.guard";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../../common/helpers/validation.helper";
import { CreateProductDto } from "../dto/create-product.dto";
import type { RequestWithUser } from "../../../common/types/request-with-user.interface";
import { UpdateProductDto } from "../dto/update-product.dto";
import {t } from "../../../locales";
import { ProductsSearchResponseDto } from "../dto/product-frontend.dto";
import { SearchProductsService } from "../services/search-product.service";
import { SearchFiltersHelper } from "../utils/search-filters.helper";
import { UserStatusGuard } from "../../../common/guard/status.guard";

@Controller('products') 
export class ManageProductController{
    constructor(  
         private readonly createproductService: CreateProductService,
        private readonly updateProductService:UpdateProductService,
        private readonly searchfilter:SearchFiltersHelper,
        private readonly searchProductsService:SearchProductsService
    ){}
  @UseGuards(UserStatusGuard)
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
  throw new UnauthorizedException(t('userNotAuthenticated', req.language));
}
if (req.user?.role !== 'user' && !req.agencyId) {
  throw new ForbiddenException(t('userNotAssociatedWithAgency', req.language));
}
 const dto = plainToInstance(CreateProductDto, body);
const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);
   return this.createproductService.createProduct(dto ,images , language ,userId , agencyId!);
  }

@UseGuards(ProductOwnershipAndPermissionGuard, UserStatusGuard)


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
    throw new UnauthorizedException(t('userNotAuthenticated', language));
  }

  const dto = plainToInstance(UpdateProductDto, body);
  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);

  return this.updateProductService.updateProduct(
    Number(id),
    dto,
    userId,
    agencyId!,
    language,
    images, 
  );
}


@Get("dashboard/products")
async getDashboardProducts(
  @Req() req: RequestWithUser, 
  @Query() rawQuery: Record<string, any>,
  @Query('page') page = '1',
  @Query('view') view: 'mine' | 'agency' = 'mine' 
): Promise<ProductsSearchResponseDto> {
   const language = req.language;
  const filters = this.searchfilter.parse(rawQuery, page , );
 if (view === 'mine') {
    // Show only your own products
    filters.userId = req.userId;
  } else if (view === 'agency') {
   
    if (!req.agencyId || (req.user?.role !== 'agent' && req.user?.role !== 'agency_owner')) {
      throw new ForbiddenException(t("userNotAssociatedWithAgency", language))
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
    (view === 'agency' && (req.user?.role === 'agency_owner' || req.agentPermissions?.canViewAllPosts));

 
  return this.searchProductsService.getProducts(filters, language, isProtectedRoute);
}


}



/// implement this code tomorrow



// import { Controller, Post, Patch, Body, Param, UploadedFiles, UseInterceptors, Req, UseGuards } from '@nestjs/common';
// import { FilesInterceptor } from '@nestjs/platform-express';
// import { plainToInstance } from 'class-transformer';
// import { validate } from 'class-validator';
// import { throwValidationErrors } from '../../../common/helpers/validation.helper';
// import { CreateProductDto } from '../dto/create-product.dto';
// import { UpdateProductDto } from '../dto/update-product.dto';
// import type { RequestWithUser } from '../../../common/types/request-with-user.interface';
// import { t } from '../../../locales';
// import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
// import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
// import { UploadProductImagesUseCase } from '../../product-image/application/use-cases/upload-product-images.use-case';
// import { DeleteProductImagesUseCase } from '../../product-image/application/use-cases/delete-product-images.use-case';
// import { CreateProductAttributesUseCase } from '../../product-attribute/application/use-cases/create-product-attributes.use-case';
// import { DeleteProductAttributesUseCase } from '../../product-attribute/application/use-cases/delete-product-attributes.use-case';
// import { UserStatusGuard } from '../../../common/guard/status.guard';
// import { ProductOwnershipAndPermissionGuard } from '../../../common/guard/product-ownership.guard';
// @Controller('products')
// export class ManageProductController {
// constructor(
// private readonly createProductUseCase: CreateProductUseCase,
// private readonly updateProductUseCase: UpdateProductUseCase,
// private readonly uploadImagesUseCase: UploadProductImagesUseCase,
// private readonly deleteImagesUseCase: DeleteProductImagesUseCase,
// private readonly createAttributesUseCase: CreateProductAttributesUseCase,
// private readonly deleteAttributesUseCase: DeleteProductAttributesUseCase,
// ) {}
// @UseGuards(UserStatusGuard)
// @Post('add')
// @UseInterceptors(FilesInterceptor('images', 7))
// async createProduct(
// @Body() body: Record<string, any>,
// @UploadedFiles() images: Express.Multer.File[],
// @Req() req: RequestWithUser
// ) {
// const language = req.language;
// const userId = req.userId!;
// const agencyId = req.agencyId;
// const dto = plainToInstance(CreateProductDto, body);
// const errors = await validate(dto);
// if (errors.length > 0) throwValidationErrors(errors, language);

// // Create product
// const productId = await this.createProductUseCase.execute(dto, userId, agencyId);

// // Upload images
// let uploadedImages: { id: number; imageUrl: string }[] = [];
// if (images?.length) {
//   uploadedImages = await this.uploadImagesUseCase.execute(images, productId, userId, language);
// }

// // Create attributes
// if (dto.attributes?.length) {
//   await this.createAttributesUseCase.execute(productId, dto.subcategoryId, dto.attributes, language);
// }

// return {
//   success: true,
//   message: t('successadded', language),
//   product: { id: productId, images: uploadedImages },
// };
// }
// @UseGuards(ProductOwnershipAndPermissionGuard, UserStatusGuard)
// @Patch('update/:id')
// @UseInterceptors(FilesInterceptor('images', 7))
// async updateProduct(
// @Param('id') id: string,
// @Body() body: Record<string, any>,
// @UploadedFiles() images: Express.Multer.File[],
// @Req() req: RequestWithUser
// ) {
// const language = req.language;
// const userId = req.userId!;
// const productId = Number(id);
// const dto = plainToInstance(UpdateProductDto, body);
// const errors = await validate(dto);
// if (errors.length > 0) throwValidationErrors(errors, language);

// // Update product fields
// await this.updateProductUseCase.execute(productId, dto, language);

// // Update attributes
// if (dto.attributes?.length) {
//   await this.deleteAttributesUseCase.execute(productId);
//   const product = await this.findProductByIdUseCase.execute(productId, language);
//   await this.createAttributesUseCase.execute(productId, product.subcategoryId, dto.attributes, language);
// }

// // Update images
// let uploadedImages: { id: number; imageUrl: string }[] = [];
// if (images?.length) {
//   await this.deleteImagesUseCase.execute(productId);
//   uploadedImages = await this.uploadImagesUseCase.execute(images, productId, userId, language);
// }

// return {
//   success: true,
//   message: t('productUpdated', language),
//   product: { id: productId, images: uploadedImages },
// };
// }
// }