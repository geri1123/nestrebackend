
import { 
  Controller, Get, Post, Body, Query, Req, HttpCode 
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationEmailDto } from '../dto/resend-verification.dto';
import { type RequestWithLang } from '../../../middlewares/language.middleware';
import { SupportedLang } from '../../../locales';
import { Public } from '../../../common/decorators/public.decorator';
import { throwValidationErrors } from '../../../common/helpers/validation.helper';
import { t } from '../../../locales';
import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
import { ResendVerificationEmailUseCase } from '../application/use-cases/resend-verification-email.use-case';
import { EmailVerificationSwagger } from '../responses/email-verification.response';

@Controller('auth')
@Public()
export class EmailVerificationController {
  constructor(
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendVerificationUseCase: ResendVerificationEmailUseCase,
  ) {}

  @EmailVerificationSwagger.VerifyEmail()
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

    const result = await this.verifyEmailUseCase.execute(dto.token, lang);

    return {
      success: true,
      message: result.alreadyVerified 
        ? t('emailAlreadyVerified', lang)
        : t('emailVerified', lang),
      alreadyVerified: result.alreadyVerified || false
    };
  }

  @EmailVerificationSwagger.ResendVerificationEmail()
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

// import { 
//   Controller, Get, Post, Body, Query, Req, HttpCode 
// } from '@nestjs/common';

// import { plainToInstance } from 'class-transformer';
// import { validate } from 'class-validator';

// import { VerifyEmailDto } from '../dto/verify-email.dto';
// import { ResendVerificationEmailDto } from '../dto/resend-verification.dto';

// import {type RequestWithLang  } from '../../../middlewares/language.middleware';
// import { SupportedLang } from '../../../locales';

// import { Public } from '../../../common/decorators/public.decorator';
// import { throwValidationErrors } from '../../../common/helpers/validation.helper';
// import { t } from '../../../locales';


// // USE-CASES DIRECTLY
// import { VerifyEmailUseCase } from '../application/use-cases/verify-email.use-case';
// import { ResendVerificationEmailUseCase } from '../application/use-cases/resend-verification-email.use-case';
// import { EmailVerificationSwagger } from '../responses/email-verification.response';
// @Controller('auth')
// @Public()
// export class EmailVerificationController {
//   constructor(
//     private readonly verifyEmailUseCase: VerifyEmailUseCase,
//     private readonly resendVerificationUseCase: ResendVerificationEmailUseCase,
//   ) {}

//   // ---------------------------------
//   // GET /auth/verify-email?token=xxx

//   // ---------------------------------
//  @EmailVerificationSwagger.VerifyEmail()
//   @Get('verify-email')
//   @HttpCode(200)

//   async verifyEmail(
//     @Query() query: Record<string, any>,
//     @Req() req: RequestWithLang
//   ) {
//     const lang: SupportedLang = req.language || 'al';

//     const dto = plainToInstance(VerifyEmailDto, query);
//     const errors = await validate(dto);
//     if (errors.length > 0) throwValidationErrors(errors, lang);

//     await this.verifyEmailUseCase.execute(dto.token, lang);

//     return {
//       success: true,
//       message: t('emailVerified', lang),
//     };
//   }


//   // -------------------------------------------
//   // POST /auth/resend-verification
//   // -------------------------------------------
//   @EmailVerificationSwagger.ResendVerificationEmail()
//   @Post('resend-verification')
 
//   async resendVerificationEmail(
//     @Body() body: Record<string, any>,
//     @Req() req: RequestWithLang
//   ) {
//     const lang: SupportedLang = req.language || 'al';

//     const dto = plainToInstance(ResendVerificationEmailDto, body);
//     const errors = await validate(dto);
//     if (errors.length > 0) throwValidationErrors(errors, lang);

//     await this.resendVerificationUseCase.execute(dto.identifier, lang);

//     return {
//       success: true,
//       message: t('verificationEmailResent', lang),
//     };
//   }
// }