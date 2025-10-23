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

 @Get('verify')
  @ApiQuery({ name: 'token', required: true, description: 'Verification token', example: 'abc123def456' })
  @ApiResponse({ status: 201, description: 'Email succesfully verified' ,type:VerifyEmailSwagerSuccessResponse})
 @ApiResponse({
  status: 400,
  description: 'Validation failed',
  type:VerifyEmailFieldResponseSwagger ,
})
@ApiBody({type:VerifyEmailDtoSwagger})
@HttpCode(200)
async verifyEmail(
  @Query() query: Record<string, any>, 
  @Req() req: RequestWithLang
) {
  const language: SupportedLang = req.language || 'al';
  const DtoClass = VerificationEmalFactory(language);

 
  const dto = plainToInstance(DtoClass, query);

  
  const errors = await validate(dto);
  if (errors.length > 0) {
    throwValidationErrors(errors, language);
  }
    await this.emailVerificationService.verify(dto.token, language);

  return { success: true, message: t('emailVerified', language) };
}
@Post('resend')
@HttpCode(200)

@ApiBody({type:ResendEmailSwagerdto})
@ApiResponse({ status: 201, description: 'Token successfully send' ,type:ResendEmailSuccessResponse})
 @ApiResponse({
  status: 400,
  description: 'Validation failed',
  type: ResendEmailFieldResponse,
})
async resendVerificationEmail(
  @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: ResendVerificationEmailDto,
  @Req() req: RequestWithLang,
) {
  const language = req.language;
  const DtoClass = ResendVeificationEmalFactory(language);
  const dto = plainToInstance(DtoClass, body);

  // Manually validate
  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, language);

  await this.emailVerificationService.resend(dto.identifier, language);
  return { success: true, message: t('verificationEmailResent', language) };
}
}