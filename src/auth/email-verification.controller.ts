import { Controller, Get, Post, Body, Query, Req, HttpCode, ValidationPipe } from '@nestjs/common';


import type { ResendVerificationEmailDto } from './dto/resend-verification.dto';
import { VerificationEmalFactory, VerifyEmailDtoSwagger, VerifyEmailFieldResponseSwagger, VerifyEmailSwagerSuccessResponse } from './dto/verify-email.dto';
 import { ResendEmailFieldResponse, ResendEmailSuccessResponse, ResendEmailSwagerdto, ResendVeificationEmalFactory } from './dto/resend-verification.dto';
import type { SupportedLang } from '../locales';
import { EmailVerificationService } from './email-verification.service';
import type { RequestWithLang } from '../middlewares/language.middleware';
import { Public } from '../common/decorators/public.decorator';
import { t } from '../locales';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../common/helpers/validation.helper';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('auth')
@Controller('auth/email')
@Public()
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}


  //get verify email
   @Get('verify')
  @ApiQuery({ name: 'token', required: true, description: 'Verification token', example: 'abc123def456' })
  @ApiResponse({ status: 200, description: 'Email successfully verified', type: VerifyEmailSwagerSuccessResponse })
  @ApiResponse({ status: 400, description: 'Validation failed', type: VerifyEmailFieldResponseSwagger })
  @ApiBody({ type: VerifyEmailDtoSwagger })
  @HttpCode(200)
  async verifyEmail(
    @Query() query: Record<string, any>,
    @Req() req: RequestWithLang
  ) {
    const language: SupportedLang = req.language || 'al';
    const DtoClass = VerificationEmalFactory(language);
    const dto = plainToInstance(DtoClass, query);

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
  @Post('resend')
  @HttpCode(200)
  @ApiBody({ type: ResendEmailSwagerdto })
  @ApiResponse({ status: 200, description: 'Token successfully sent', type: ResendEmailSuccessResponse })
  @ApiResponse({ status: 400, description: 'Validation failed', type: ResendEmailFieldResponse })
  async resendVerificationEmail(
    @Body() body: Record<string, any>,
    @Req() req: RequestWithLang
  ) {
    const language: SupportedLang = req.language || 'al';
    const DtoClass = ResendVeificationEmalFactory(language);
    const dto = plainToInstance(DtoClass, body);

    // Validate class-validator rules
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors, language);

    // Call service
    await this.emailVerificationService.resend(dto.identifier, language);

    return { success: true, message: t('verificationEmailResent', language) };
  }
}