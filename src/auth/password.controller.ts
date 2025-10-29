import {
  Controller,
  Post,
  Body,
  Req,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import type { RequestWithLang } from '../middlewares/language.middleware';

import { SupportedLang, t } from '../locales';
import { PasswordRecoveryService } from './password.service';

import {  plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../common/helpers/validation.helper';
import { PasswordSwagger } from './swagger/password.swagger';

@Controller('password')
export class PasswordController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

 @Post('reset-password')
@HttpCode(HttpStatus.OK)
@PasswordSwagger.ResetPassword()
async resetPassword(@Body() body: Record<string, any>, @Req() req: RequestWithLang) {
  const lang: SupportedLang = req.language || 'al';
  const dto = plainToInstance(ResetPasswordDto, body);
 

  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, lang);

  if (dto.newPassword !== dto.repeatPassword) {
    throw new BadRequestException({
      repeatPassword: [t('passwordsMismatch', lang)],
    });
  }

  await this.passwordRecoveryService.resetPassword(dto.token, dto.newPassword, lang);

  return {
    success: true,
    message: t('passwordResetSuccess', lang),
  };
}
  @Post('forgot-password')
@HttpCode(HttpStatus.OK)
@PasswordSwagger.ForgotPassword()
async forgotPassword(@Body() body:  Record<string, any>, @Req() req: RequestWithLang) {
  const lang: SupportedLang = req.language || 'al';

  // Validate DTO
  const dto = plainToInstance(RecoverPasswordDto, body);
  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, lang);

  await this.passwordRecoveryService.requestPasswordReset(dto.email, lang);

  return {
    success: true,
    message: t('passwordResetLinkSent', lang),
  };
}
}