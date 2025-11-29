import { Controller, Post, Get, Delete, Param, Req, Query, UnauthorizedException } from '@nestjs/common';
import {type RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SaveProductUseCase } from '../application/use-cases/save-product.usecase';
import { UnsaveProductUseCase } from '../application/use-cases/unsave-product.usecase';
import { GetSavedProductsUseCase } from '../application/use-cases/get-saved-products.usecase';
import { t } from '../../../locales';

@Controller('save-product')
export class SaveProductController {
  constructor(
    private readonly saveProductUseCase: SaveProductUseCase,
    private readonly unsaveProductUseCase: UnsaveProductUseCase,
    private readonly getSavedProductsUseCase: GetSavedProductsUseCase
  ) {}

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

  @Get('get-saved')
  async getSavedProducts(@Req() req: RequestWithUser, @Query('page') page = '1') {
    const { language, userId } = req;
    const pageNumber = parseInt(page, 10) || 1;
    const productPerPage = 12;

    return this.getSavedProductsUseCase.execute(userId, language, pageNumber, productPerPage);
  }

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

// import { Controller, Req,Param, Post, UnauthorizedException, Get, Query, Delete } from "@nestjs/common";
// import {type RequestWithUser } from "../../common/types/request-with-user.interface";
// import { SaveProductService } from "./save-product.service";
// import { t } from "../../locales";



// @Controller('save-product')

// export class SaveProductController{
//     constructor (private readonly saveProductService:SaveProductService){}

//     @Post(":id")
//     async save(
//      @Param("id")  id:string,
//      @Req()  req:RequestWithUser
//     ){
        
//         const {userId , language}=req;
//         const prductId=Number(id);
//           if (!userId) {
//       throw new UnauthorizedException(t('userNotAuthenticated' , language));
//     }
//      await this.saveProductService.saveProduct(userId,  prductId, language)
//       return {
//       success: true,
//       message: t("productSavedSuccessfully", language),
      
//     };
//     }
  
//     @Get("get-saved")
//     async getSavedProducts(
//         @Req() req:RequestWithUser,
//         @Query("page") page='1',

//     ){
//           const {language, userId}=req;
// const pageNumber = parseInt(page, 10) || 1;
// const productperpage=12;
//           return this.saveProductService.getSavedProduct(userId, language , pageNumber, productperpage)


//     };

//      @Delete("unsave/:id")
//   async unsave(
//     @Param("id") id: string,
//     @Req() req: RequestWithUser
//   ) {
//     const { userId, language } = req;
//     if (!userId) {
//       throw new UnauthorizedException(t('userNotAuthenticated', language));
//     }
//     const productId = Number(id);
//     await this.saveProductService.unsave(productId, userId, language);

//     return {
//       success: true,
//       message: t("productUnsavedSuccessfully", language),
//     };
//   }



    
// }
