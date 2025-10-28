import {
  Controller,
  Post,
  Body,
  Req,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ResetPasswordDto, ResetPasswordSwaggerDto } from './dto/reset-password.dto';
import { ForgotPasswordFailedResponseDto, ForgotPasswordSuccessResponseDto, RecoverPasswordDto } from './dto/recover-password.dto';
import type { RequestWithLang } from '../middlewares/language.middleware';
import { RecoveryPasswordSwaggerDto } from './dto/recover-password.dto';
import { SupportedLang, t } from '../locales';
import { PasswordRecoveryService } from './password.service';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../common/helpers/validation.helper';
import { ResetFailedResponseDto } from './dto/reset-password.dto';
import { ResetSuccessResponseDto } from './dto/reset-password.dto';
@ApiTags('password')
@Controller('password')
export class PasswordController {
  constructor(
    private readonly passwordRecoveryService: PasswordRecoveryService,
  ) {}

 @Post('reset-password')
@ApiBody({ type: ResetPasswordSwaggerDto })
@ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
@ApiResponse({ status: 200, description: 'Password successfully reset', type: ResetSuccessResponseDto })
@ApiResponse({ status: 400, description: 'Failed to reset', type: ResetFailedResponseDto })
@HttpCode(HttpStatus.OK)
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
@ApiBody({ type: RecoveryPasswordSwaggerDto })
@ApiResponse({ status: 200, description: 'Token successfully sent', type: ForgotPasswordSuccessResponseDto })
@ApiResponse({ status: 400, description: 'Failed to send token', type: ForgotPasswordFailedResponseDto })
@HttpCode(HttpStatus.OK)
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