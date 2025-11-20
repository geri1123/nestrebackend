import { Controller, Param, ParseIntPipe, Post, Req, UnauthorizedException } from "@nestjs/common";
import { RegistrationRequestService } from "./registration_request.service";
import { Roles } from "../../common/decorators/roles.decorator";
import {type RequestWithUser } from "../../common/types/request-with-user.interface";
import { t } from "../../locales";

@Controller('registration-request')

export class RegistrationRequestController{
    constructor(
    private  registrationReqService:RegistrationRequestService
    ){

    }

    @Roles('user')
@Post('quick-request/:agencyId')
async sendQuickRequest(
  @Req() req: RequestWithUser,
  @Param('agencyId', ParseIntPipe) agencyId: number,
) {
  if (!req.userId) {
    throw new UnauthorizedException(t('userNotAuthenticated', req.language));
  }

  await this.registrationReqService.sendQuickRequestToAgency(
    req.userId,
    agencyId,
    req.user.username,
    req.language,
  );
return{
    success:true, 
    message:t("requestSentSuccessfully",  req.language)
}
}
}