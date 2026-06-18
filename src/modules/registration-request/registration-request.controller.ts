import { Controller, Get, Param, ParseIntPipe, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";

import { Roles } from "../../common/decorators/roles.decorator";
import {type RequestWithUser } from "../../common/types/request-with-user.interface";
import { t } from "../../locales";
import { SendQuickRequestUseCase } from "./application/use-cases/send-quick-request.use-case";
import { ApiGetActiveRequest, ApiSendQuickRequest } from "./decorators/registration-request.decorators";
import { RolesGuard } from "../../infrastructure/auth/guard/role-guard";
import { FindRequestByUserIdUseCase } from "./application/use-cases/find-requests-by-user-id.use-case";
import { Throttle } from "../../common/decorators/throttle.decorator";
@UseGuards(RolesGuard)
@Controller('registration-request')

export class RegistrationRequestController{
    constructor(
    private  sendquickRequest:SendQuickRequestUseCase ,
    private findActiveRequest:FindRequestByUserIdUseCase,
    ){

    }

    @Roles('user')
    @UseGuards(RolesGuard)
    @ApiSendQuickRequest()
@Post('quick-request/:agencyId')
@Throttle(1, 300)
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
@ApiGetActiveRequest()
@Get('my-active-request')
@Throttle(30, 60)
async getActiveRequest(@Req() req: RequestWithUser) {
  const request = await this.findActiveRequest.execute(req.userId, req.language);
  return {
    success: true,
    data: request ?? null
  };
}
}