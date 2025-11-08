import {  Body, Controller, ForbiddenException, Param, Patch, Post, Req, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
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

@Controller('products') 
export class ManageProductController{
    constructor(  
         private readonly createproductService: CreateProductService,
        private readonly updateProductService:UpdateProductService
    ){}

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
 if (!agencyId) {
  throw new ForbiddenException(t('userNotAssociatedWithAgency', req.language));
}
 const dto = plainToInstance(CreateProductDto, body);
const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);
   return this.createproductService.createProduct(dto ,images , language ,userId , agencyId!);
  }

@UseGuards(ProductOwnershipAndPermissionGuard)
@Permissions(["can_edit_others_post"])

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
}