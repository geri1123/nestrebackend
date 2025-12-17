import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Req,
  Res,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../common/helpers/validation.helper';
import type { Response } from 'express';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { SupportedLang, t } from '../../locales';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AuthSwagger } from './swagger/auth.swagger';

import { LoginDto } from './dto/login.dto';
import { BaseRegistrationDto } from '../registration/dto/base-registration.dto';
import { RegisterAgencyOwnerDto } from '../registration/dto/register-agency-owner.dto';
import { RegisterAgentDto } from '../registration/dto/register-agent.dto';

// Import use cases
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUserUseCase } from '../registration/application/use-cases/register-user.use-case';
import { RegisterAgencyOwnerUseCase } from '../registration/application/use-cases/register-agency-owner.use-case';
import { RegisterAgentUseCase } from '../registration/application/use-cases/register-agent.use-case';
import { AuthCookieService } from './infrastructure/services/auth-cookie.service';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly authCookieService:AuthCookieService,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly registerAgencyOwnerUseCase: RegisterAgencyOwnerUseCase,
    private readonly registerAgentUseCase: RegisterAgentUseCase,
    private readonly googleLoginUseCase:GoogleLoginUseCase,
  ) {}

  @AuthSwagger.Login()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 240000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    // @Body() body: Record<string, any>,
    @Body() dto:LoginDto,
    @Req() req: RequestWithLang,
    @Res({ passthrough: true }) res: Response,
  ) {
    const lang: SupportedLang = req.language || 'al';
    // const dto = plainToInstance(LoginDto, body);

    // const errors = await validate(dto);
    // if (errors.length > 0) throwValidationErrors(errors, lang);

    const { user, token } = await this.loginUseCase.execute(dto, lang);
this.authCookieService.setAuthCookie(res, token, dto.rememberMe ?? false);
   
    return {
      success: true,
      message: t('loginSuccess', lang),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  @AuthSwagger.RegisterUser()
  @Post('register/user')
  @Throttle({ default: { limit: 6, ttl: 240000 } })
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    // @Body() body: Record<string, any>,
    @Body() dto:BaseRegistrationDto,
     
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';

    await this.registerUserUseCase.execute(dto, lang, 'user');

    return {
      success: true,
      message: t('registrationSuccess', lang),
    };
  }

  @AuthSwagger.RegisterAgencyOwner()
  @Post('register/agency_owner')
  @Throttle({ default: { limit: 6, ttl: 240000 } })
  @HttpCode(HttpStatus.CREATED)
  async registerAgencyOwner(
    // @Body() body: Record<string, any>,
    @Body() dto:RegisterAgencyOwnerDto,
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';
    // const dto = plainToInstance(RegisterAgencyOwnerDto, body);

    // Validate DTO
    // const errors = await validate(dto);
    // if (dto.password !== dto.repeatPassword) {
    //   throwValidationErrors(errors, lang, {
    //     repeatPassword: [t('passwordsMismatch', lang)],
    //   });
    // }
    // if (errors.length > 0) {
    //   throwValidationErrors(errors, lang);
    // }

    return this.registerAgencyOwnerUseCase.execute(dto, lang);
  }

  @AuthSwagger.RegisterAgent()
  @Post('register/agent')
  @Throttle({ default: { limit: 6, ttl: 240000 } })
  @HttpCode(HttpStatus.CREATED)
  async registerAgent(
    // @Body() body: Record<string, any>,
    @Body() dto:RegisterAgentDto,
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';
    // const dto = plainToInstance(RegisterAgentDto, body);

    // // Validate DTO
    // const errors = await validate(dto);
    // if (dto.password !== dto.repeatPassword) {
    //   throwValidationErrors(errors, lang, {
    //     repeatPassword: [t('passwordsMismatch', lang)],
    //   });
    // }
    // if (errors.length > 0) {
    //   throwValidationErrors(errors, lang);
    // }

    return this.registerAgentUseCase.execute(dto, lang);
  };
  @Post('google')
@Public()
async googleLogin(
  @Body('idToken') idToken: string,
  @Res({ passthrough: true }) res: Response
) {
  return this.googleLoginUseCase.execute(idToken, res);
}
}



 // const maxAge = dto.rememberMe
    //   ? 30 * 24 * 60 * 60 * 1000
    //   : 24 * 60 * 60 * 1000;

    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //   maxAge,
    //   path: '/',
    // });

