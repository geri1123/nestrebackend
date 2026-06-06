import { Controller, Delete, Req, Res, UnauthorizedException } from "@nestjs/common";
import { RequestWithUser } from "../../common/types/request-with-user.interface";
import { DeleteUserByIdUseCase } from "./application/use-cases/delete-user.use-case";
import { t } from "../../locales";
import { AuthCookieService } from "../auth/infrastructure/services/auth-cookie.service";
import { Response } from "express";

@Controller('cleanup')
export class CleanupController {
  constructor(
    private readonly deleteuser: DeleteUserByIdUseCase  ,
    private readonly authCookieService: AuthCookieService
  ) {}
  @Delete('delete-user')
  async deleteUser(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,  
  ) {
    if (!req.user) {
      throw new UnauthorizedException(t('userNotAuthenticated', req.language));
    }

    await this.deleteuser.execute(req.user.id);
    this.authCookieService.clearAllCookies(res);

    return {
      success: true,
      message: t("userdeleted", req.language),
    };
  }
}
