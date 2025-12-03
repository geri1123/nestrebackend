import { 
  Controller, Get, Post, Body, Query, Req, HttpCode 
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationEmailDto } from '../dto/resend-verification.dto';

import {type RequestWithLang  } from '../../../middlewares/language.middleware';
import { SupportedLang } from '../../../locales';

import { Public } from '../../../common/decorators/public.decorator';
import { throwValidationErrors } from '../../../common/helpers/validation.helper';
import { t } from '../../../locales';


// USE-CASES DIRECTLY
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from '../application/use-cases/resend-verification-email.use-case';
@Controller('auth')
@Public()
export class EmailVerificationController {
  constructor(
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationEmailUseCase,
  ) {}

  // ---------------------------------
  // GET /auth/verify-email?token=xxx
  // ---------------------------------
  @Get('verify-email')
  @HttpCode(200)

  async verifyEmail(
    @Query() query: Record<string, any>,
    @Req() req: RequestWithLang
  ) {
    const lang: SupportedLang = req.language || 'al';

    const dto = plainToInstance(VerifyEmailDto, query);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, lang);

    await this.verifyEmailUseCase.execute(dto.token, lang);

    return {
      success: true,
      message: t('emailVerified', lang),
    };
  }

  // -------------------------------------------
  // POST /auth/resend-verification
  // -------------------------------------------
  @Post('resend-verification')
 
  async resendVerificationEmail(
    @Body() body: Record<string, any>,
    @Req() req: RequestWithLang
  ) {
    const lang: SupportedLang = req.language || 'al';

    const dto = plainToInstance(ResendVerificationEmailDto, body);
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, lang);

    await this.resendVerificationUseCase.execute(dto.identifier, lang);

    return {
      success: true,
      message: t('verificationEmailResent', lang),
    };
  }
}