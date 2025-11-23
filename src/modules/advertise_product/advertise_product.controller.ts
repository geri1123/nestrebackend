import { Body, Controller, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
// import { AdvertiseProductService } from "./advertise_product.service";
import {type RequestWithUser } from "../../common/types/request-with-user.interface";
import { AdvertiseDto } from "./dto/advertise.dto";
import { t } from "../../locales";

@Controller("advertise")

export class AdvertiseProductController{
    // constructor(private readonly advertiseService:AdvertiseProductService){}

    @Post()
    async advertise(
        @Req() req:RequestWithUser,
        @Body() data:AdvertiseDto
    ){
        const {userId , language}=req;
        if(!userId){
            throw new UnauthorizedException(t('userNotAuthenticated' , language))

        }
        // const addvertise=this.advertiseService.advertise(userId , data , language )
        return{
            success:true,
            message:t("successfullyAdvertised", language)
        }

    }
}