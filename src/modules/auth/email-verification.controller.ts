import { Controller, Get, Post, Body, Query, Req, HttpCode, ValidationPipe } from '@nestjs/common';


import {  VerifyEmailDto } from './dto/verify-email.dto';
 import { ResendVerificationEmailDto } from './dto/resend-verification.dto';
import type { SupportedLang } from '../../locales';
import { EmailVerificationService } from './email-verification.service';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { Public } from '../../common/decorators/public.decorator';
import { t } from '../../locales';
import {  plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../common/helpers/validation.helper';
import { AuthSwagger } from './swagger/auth.swagger';

@Controller('auth')
@Public()
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}


  //get verify email
   @Get('verify-email')
 
  @HttpCode(200)
  @AuthSwagger.VerifyEmail() 
  async verifyEmail(
    @Query() query: Record<string, any>,
    @Req() req: RequestWithLang
  ) {
    const language: SupportedLang = req.language || 'al';
   
    const dto = plainToInstance(VerifyEmailDto, query);

    // Validate class-validator rules
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);

    // Call service — it handles all further validation and error merging
    await this.emailVerificationService.verify(dto.token, language);

    return { success: true, message: t('emailVerified', language) };
  }

  // --------------------------
  // RESEND VERIFICATION EMAIL
  // --------------------------
  @Post('resend-verification')
  @AuthSwagger.ResendVerification()
  async resendVerificationEmail(
    @Body() body: Record<string, any>,
    @Req() req: RequestWithLang
  ) {
    const language: SupportedLang = req.language || 'al';
    const DtoClass = ResendVerificationEmailDto;
    const dto = plainToInstance(DtoClass, body);

    // Validate class-validator rules
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);

    // Call service
    await this.emailVerificationService.resend(dto.identifier, language);

    return { success: true, message: t('verificationEmailResent', language) };
  }
}