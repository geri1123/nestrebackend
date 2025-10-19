import {
  Controller,
  Post,
  Body,
  Req,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { ResetPasswordDtoFactory, ResetPasswordSwaggerDto } from './dto/reset-password.dto';
import { ForgotPasswordFailedResponseDto, ForgotPasswordSuccessResponseDto, RecoverPasswordDtoFactory } from './dto/recover-password.dto';
import type { RequestWithLang } from '../middlewares/language.middleware';
import { RecoveryPasswordSwaggerDto } from './dto/recover-password.dto';
import { SupportedLang, t } from '../locales';
import { PasswordRecoveryService } from './password.service';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
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
    @ApiResponse({ status: 200, description: 'Password succesfully reset', type: ResetSuccessResponseDto })
@ApiResponse({ status: 400, description: 'Failed too reset', type: ResetFailedResponseDto })

  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: Record<string, any>, @Req() req: RequestWithLang) {
    const lang: SupportedLang = req.language || 'al';
    const DtoClass = ResetPasswordDtoFactory(lang);
    const dto = plainToClass(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    // Manual password match validation
    if (dto.newPassword !== dto.repeatPassword) {
      throw new BadRequestException({
        repeatPassword: [t('passwordsMismatch', lang)],
      });
    }

    // Call service to reset password
    await this.passwordRecoveryService.resetPassword(
      dto.token,
      dto.newPassword,
      lang,
    );

    return {
      
      message: t('passwordResetSuccess', lang),
    };
  }

  @Post('forgot-password')
  @ApiBody({ type: RecoveryPasswordSwaggerDto })
  @ApiResponse({})
   @ApiResponse({ status: 200, description: 'TOKEN SUCCESFULLY SEND', type: ForgotPasswordSuccessResponseDto })
@ApiResponse({ status: 400, description: 'Failed TO SEND TOKEN', type:ForgotPasswordFailedResponseDto })

  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: Record<string, any>, @Req() req: RequestWithLang) {
    const lang: SupportedLang = req.language || 'al';
    const DtoClass = RecoverPasswordDtoFactory(lang);
    const dto = plainToClass(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    await this.passwordRecoveryService.requestPasswordReset(
      dto.email,
      lang,
    );

    return {
        success:true,
      message: t('passwordResetLinkSent', lang),
    };
  }
}