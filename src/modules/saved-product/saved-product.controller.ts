import { Controller, Req,Param, Post, UnauthorizedException, Get, Query, Delete } from "@nestjs/common";
import {type RequestWithUser } from "../../common/types/request-with-user.interface";
import { SaveProductService } from "./save-product.service";
import { t } from "../../locales";



@Controller('save-product')

export class SaveProductController{
    constructor (private readonly saveProductService:SaveProductService){}

    @Post(":id")
    async save(
     @Param("id")  id:string,
     @Req()  req:RequestWithUser
    ){
        
        const {userId , language}=req;
        const prductId=Number(id);
          if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated' , language));
    }
     return this.saveProductService.saveProduct(userId,  prductId, language)
    }
  
    @Get("get-saved")
    async getSavedProducts(
        @Req() req:RequestWithUser,
        @Query("page") page='1',

    ){
          const {language, userId}=req;
const pageNumber = parseInt(page, 10) || 1;
const productperpage=12;
          return this.saveProductService.getSavedProduct(userId, language , pageNumber, productperpage)


    };

     @Delete("unsave/:id")
  async unsave(
    @Param("id") id: string,
    @Req() req: RequestWithUser
  ) {
    const { userId, language } = req;
    if (!userId) {
      throw new UnauthorizedException(t('userNotAuthenticated', language));
    }
    const productId = Number(id);
    await this.saveProductService.unsave(productId, userId, language);

    return {
      success: true,
      message: t("productUnsavedSuccessfully", language),
    };
  }



    
}
