import { Controller, Param, ParseIntPipe, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";

import { Roles } from "../../common/decorators/roles.decorator";
import {type RequestWithUser } from "../../common/types/request-with-user.interface";
import { t } from "../../locales";
import { SendQuickRequestUseCase } from "./application/use-cases/send-quick-request.use-case";
import { ApiSendQuickRequest } from "./decorators/registration-request.decorators";
import { RolesGuard } from "../../common/guard/role-guard";
@UseGuards(RolesGuard)
@Controller('registration-request')

export class RegistrationRequestController{
    constructor(
    private  sendquickRequest:SendQuickRequestUseCase
    ){

    }

    @Roles('user')
    @UseGuards(RolesGuard)
    @ApiSendQuickRequest()
@Post('quick-request/:agencyId')
async sendQuickRequest(
  @Req() req: RequestWithUser,
  @Param('agencyId', ParseIntPipe) agencyId: number,
) {
  if (!req.userId) {
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  await this.sendquickRequest.execute(
    req.userId,
    agencyId,
    req.user?.username || 'Guest',
    req.language,
  );
return{
    success:true, 
    message:t("requestSentSuccessfully",  req.language)
}
}
}