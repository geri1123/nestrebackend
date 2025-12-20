import { Controller, Post, Get, Delete, Param, Req, Query, UnauthorizedException } from '@nestjs/common';
import {type RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SaveProductUseCase } from '../application/use-cases/save-product.usecase';
import { UnsaveProductUseCase } from '../application/use-cases/unsave-product.usecase';
import { GetSavedProductsUseCase } from '../application/use-cases/get-saved-products.usecase';
import { t } from '../../../locales';
import { SaveProductSwagger } from '../responses/save-product.swaggee.response';

@Controller('save-product')
export class SaveProductController {
  constructor(
    private readonly saveProductUseCase: SaveProductUseCase,
    private readonly unsaveProductUseCase: UnsaveProductUseCase,
    private readonly getSavedProductsUseCase: GetSavedProductsUseCase
  ) {}
@SaveProductSwagger.SaveProduct()
  @Post(':id')
  async save(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, language } = req;
    const productId = Number(id);

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }

    await this.saveProductUseCase.execute(userId, productId, language);

    return {
      success: true,
      message: t('productSavedSuccessfully', language),
    };
  }

  @SaveProductSwagger.GetSavedProducts()
 @Get('get-saved')
async getSavedProducts(@Req() req: RequestWithUser, @Query('page') page = '1') {
  try {
    const { language, userId } = req;
    const pageNumber = parseInt(page, 10) || 1;
    const productPerPage = 12;

    return await this.getSavedProductsUseCase.execute(userId, language, pageNumber, productPerPage);
  } catch (error) {
    console.error('Error in getSavedProducts:', error);
    throw error; 
  }
}
@SaveProductSwagger.UnsaveProduct()
  @Delete('unsave/:id')
  async unsave(@Param('id') id: string, @Req() req: RequestWithUser) {
    const { userId, language } = req;

    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }

    const productId = Number(id);
    await this.unsaveProductUseCase.execute(userId, productId, language);

    return {
      success: true,
      message: t('productUnsavedSuccessfully', language),
    };
  }
}
