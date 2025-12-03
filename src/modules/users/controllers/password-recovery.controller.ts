import { Body, Controller, Post, Req } from "@nestjs/common";

import { RequestPasswordResetUseCase } from "../application/use-cases/password/request-password-reset.use-case";
import { ResetPasswordUseCase } from "../application/use-cases/password/reset-password.use-case";
import {type RequestWithLang } from "../../../middlewares/language.middleware";
import { ResetPasswordDto } from "../dto/reset-password.dto";
import { plainToInstance } from "class-transformer";
import { throwValidationErrors } from "../../../common/helpers/validation.helper";
import { validate } from "class-validator";
import { t } from "../../../locales";
import { RecoverPasswordDto } from "../dto/recover-password.dto";
import { Public } from "../../../common/decorators/public.decorator";

@Controller('password')
export class PasswordController {
  constructor(
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: any, @Req() req: RequestWithLang) {
    const lang = req.language || 'al';
    const dto = plainToInstance(ResetPasswordDto, body);

    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, lang);
    if (dto.newPassword !== dto.repeatPassword)
      throwValidationErrors([], lang, { repeatPassword: [t('passwordsMismatch', lang)] });

    await this.resetPasswordUseCase.execute(dto.token, dto.newPassword, lang);

    return { success: true, message: t('passwordResetSuccess', lang) };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: any, @Req() req: RequestWithLang) {
    const lang = req.language || 'al';
    const dto = plainToInstance(RecoverPasswordDto, body);

    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, lang);

    await this.requestPasswordResetUseCase.execute(dto.email, lang);

    return { success: true, message: t('passwordResetLinkSent', lang) };
  }
}