import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { ProductAdvertisementService } from "./advertise-product.service";
import { AdvertiseDto } from "./dto/advertise.dto";
import { type RequestWithUser } from "../../common/types/request-with-user.interface";
import { t } from "../../locales";
import { advertisement_type } from "@prisma/client";

@Controller("advertise")
export class AdvertiseProductController {
  constructor(private readonly advertiseService: ProductAdvertisementService) {}

  @Post()
  async advertise(@Req() req: RequestWithUser, @Body() body: AdvertiseDto) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t("userNotAuthenticated", language));

    await this.advertiseService.advertise(body.productId,  body.adType || advertisement_type.normal, userId, language);

    return {
      success: true,
      message: t("successfullyAdvertised", language),
    };
  }
}
