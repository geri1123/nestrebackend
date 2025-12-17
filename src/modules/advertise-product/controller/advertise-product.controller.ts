import { Body, Controller, Post, Req, UnauthorizedException } from "@nestjs/common";
import { AdvertiseDto } from "../dto/advertise.dto";
import { type RequestWithUser } from "../../../common/types/request-with-user.interface";
import { t } from "../../../locales";
import { advertisement_type } from "@prisma/client";
import { AdvertiseProductUseCase } from "../application/use-cases/advertise-product.use-case";
import { ApiAdvertiseDecorators } from "../decorators/advertise.decorator";

@Controller("advertise")
export class AdvertiseProductController {
  constructor(private readonly advertiseUsecase: AdvertiseProductUseCase) {}

  @Post()
  @ApiAdvertiseDecorators.AdvertiseProduct()
  async advertise(@Req() req: RequestWithUser, @Body() body: AdvertiseDto) {
    const { userId, language } = req;
    if (!userId) throw new UnauthorizedException(t("userNotAuthenticated", language));

    await this.advertiseUsecase.execute(body.productId,  body.adType || advertisement_type.normal, userId, language);

    return {
      success: true,
      message: t("successfullyAdvertised", language),
    };
  }
}
