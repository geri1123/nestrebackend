// import {
//   Controller,
//   Post,
//   Body,
//   HttpStatus,
//   HttpCode,
//   Req,
//   Res,
// } from '@nestjs/common';

// import type { Response } from 'express';
// import type { RequestWithLang } from '../../middlewares/language.middleware';
// import { SupportedLang, t } from '../../locales';
// import { Throttle } from '@nestjs/throttler';
// import { Public } from '../../common/decorators/public.decorator';
// import { AuthSwagger } from './responses/auth-swagger.response';

// import { LoginDto } from './dto/login.dto';
// import { BaseRegistrationDto } from '../registration/dto/base-registration.dto';
// import { RegisterAgencyOwnerDto } from '../registration/dto/register-agency-owner.dto';
// import { RegisterAgentDto } from '../registration/dto/register-agent.dto';

// // Import use cases
// import { LoginUseCase } from './application/use-cases/login.use-case';
// import { RegisterUserUseCase } from '../registration/application/use-cases/register-user.use-case';
// import { RegisterAgencyOwnerUseCase } from '../registration/application/use-cases/register-agency-owner.use-case';
// import { RegisterAgentUseCase } from '../registration/application/use-cases/register-agent.use-case';
// import { AuthCookieService } from './infrastructure/services/auth-cookie.service';
// import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';

// @Public()
// @Controller('auth')
// export class AuthController {
//   constructor(
//     private readonly loginUseCase: LoginUseCase,
//     private readonly authCookieService:AuthCookieService,
//     private readonly registerUserUseCase: RegisterUserUseCase,
//     private readonly registerAgencyOwnerUseCase: RegisterAgencyOwnerUseCase,
//     private readonly registerAgentUseCase: RegisterAgentUseCase,
//     private readonly googleLoginUseCase:GoogleLoginUseCase,
//   ) {}

//   @AuthSwagger.Login()
//   @Post('login')
//   @Throttle({ default: { limit: 5, ttl: 240000 } })
//   @HttpCode(HttpStatus.OK)
//   async login(
//     // @Body() body: Record<string, any>,
//     @Body() dto:LoginDto,
//     @Req() req: RequestWithLang,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const lang: SupportedLang = req.language || 'al';

//     const { user, token } = await this.loginUseCase.execute(dto, lang);
// this.authCookieService.setAuthCookie(res, token, dto.rememberMe ?? false);
   
//     return {
//       success: true,
//       message: t('loginSuccess', lang),
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//     };
//   }

//   @AuthSwagger.RegisterUser()
//   @Post('register/user')
//   @Throttle({ default: { limit: 6, ttl: 240000 } })
//   @HttpCode(HttpStatus.CREATED)
//   async registerUser(
//     // @Body() body: Record<string, any>,
//     @Body() dto:BaseRegistrationDto,
     
//     @Req() req: RequestWithLang,
//   ) {
//     const lang = req.language || 'al';

//     await this.registerUserUseCase.execute(dto, lang, 'user');

//     return {
//       success: true,
//       message: t('registrationSuccess', lang),
//     };
//   }

//   @AuthSwagger.RegisterAgencyOwner()
//   @Post('register/agency_owner')
//   @Throttle({ default: { limit: 6, ttl: 240000 } })
//   @HttpCode(HttpStatus.CREATED)
//   async registerAgencyOwner(
//     // @Body() body: Record<string, any>,
//     @Body() dto:RegisterAgencyOwnerDto,
//     @Req() req: RequestWithLang,
//   ) {
//     const lang = req.language || 'al';

//     return this.registerAgencyOwnerUseCase.execute(dto, lang);
//   }

//   @AuthSwagger.RegisterAgent()
//   @Post('register/agent')
//   @Throttle({ default: { limit: 6, ttl: 240000 } })
//   @HttpCode(HttpStatus.CREATED)
//   async registerAgent(
//     @Body() dto:RegisterAgentDto,
//     @Req() req: RequestWithLang,
//   ) {
//     const lang = req.language || 'al';
 
//     return this.registerAgentUseCase.execute(dto, lang);
//   };
//   @AuthSwagger.GoogleLogin()
//   @Post('google')
// @Public()
// async googleLogin(
//   @Body('idToken') idToken: string,
//   @Res({ passthrough: true }) res: Response
// ) {
//   return this.googleLoginUseCase.execute(idToken, res);
// }

// @Post("logout")
// logout(@Res({ passthrough: true }) res: Response) {
//   this.authCookieService.clearAuthCookie(res);
//   return { success: true };
// }
// }



import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { SupportedLang, t } from '../../locales';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AuthSwagger } from './responses/auth-swagger.response';

import { LoginDto } from './dto/login.dto';
import { BaseRegistrationDto } from '../registration/dto/base-registration.dto';
import { RegisterAgencyOwnerDto } from '../registration/dto/register-agency-owner.dto';
import { RegisterAgentDto } from '../registration/dto/register-agent.dto';

import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUserUseCase } from '../registration/application/use-cases/register-user.use-case';
import { RegisterAgencyOwnerUseCase } from '../registration/application/use-cases/register-agency-owner.use-case';
import { RegisterAgentUseCase } from '../registration/application/use-cases/register-agent.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { AuthCookieService } from './infrastructure/services/auth-cookie.service';
import { GoogleLoginUseCase } from './application/use-cases/google-login.use-case';
import { AuthContextService } from '../../infrastructure/auth/services/auth-context.service';
import {type RequestWithUser } from '../../common/types/request-with-user.interface';
import { CustomThrottlerGuard } from '../../common/guard/Throttler.guard';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly authCookieService: AuthCookieService,
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly registerAgencyOwnerUseCase: RegisterAgencyOwnerUseCase,
    private readonly registerAgentUseCase: RegisterAgentUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly authContextService: AuthContextService,
  ) {}

  // ── Login ───────────────────────────────────────────────────────────────
  @AuthSwagger.Login()
  
  @Post('login')
 @Throttle({ default: { limit: 5, ttl: 240 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: RequestWithLang,
    @Res({ passthrough: true }) res: Response,
  ) {
    const lang: SupportedLang = req.language || 'al';

    const { user, accessToken, refreshToken } =
      await this.loginUseCase.execute(dto, lang);

    // Set both cookies
    this.authCookieService.setAccessCookie(res, accessToken, dto.rememberMe ?? false);
    this.authCookieService.setRefreshCookie(res, refreshToken);

    return {
      success: true,
      message: t('loginSuccess', lang),
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    };
  }

  // ── Register user 
  @AuthSwagger.RegisterUser()
  @Post('register/user')
   @Throttle({ default: { limit: 3, ttl: 600 } })
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @Body() dto: BaseRegistrationDto,
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';
    await this.registerUserUseCase.execute(dto, lang, 'user');
    return { success: true, message: t('registrationSuccess', lang) };
  }

  // ── Register agency owner 
  @AuthSwagger.RegisterAgencyOwner()
  @Post('register/agency_owner')
 @Throttle({ default: { limit: 3, ttl: 600 } })
  
  @HttpCode(HttpStatus.CREATED)
  async registerAgencyOwner(
    @Body() dto: RegisterAgencyOwnerDto,
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';
    return this.registerAgencyOwnerUseCase.execute(dto, lang);
  }

  // ── Register agent 
  @AuthSwagger.RegisterAgent()
  @Post('register/agent')

  @Throttle({ default: { limit: 3, ttl: 600 } })
  @HttpCode(HttpStatus.CREATED)
  async registerAgent(
    @Body() dto: RegisterAgentDto,
    @Req() req: RequestWithLang,
  ) {
    const lang = req.language || 'al';
    return this.registerAgentUseCase.execute(dto, lang);
  }

  // ── Google OAuth login 
  @AuthSwagger.GoogleLogin()
  @Post('google')
  @Throttle({ default: { limit: 3, ttl: 600 } })
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body('idToken') idToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.googleLoginUseCase.execute(idToken, res);
  }


  @Post('refresh')
   @Throttle({ default: { limit: 3, ttl: 600 } })
 
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: RequestWithLang & { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ) {
    const lang: SupportedLang = req.language || 'al';
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new (await import('@nestjs/common').then(m => m.UnauthorizedException))(
        t('noTokenProvided', lang),
      );
    }

    const { user, accessToken } =
      await this.refreshTokenUseCase.execute(refreshToken, lang);

    this.authCookieService.setAccessCookie(res, accessToken, false);

    return {
      success: true,
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
    };
  }

  // ── Logout 
  @Post('logout')
  @Throttle({ default: { limit: 3, ttl: 600 } })
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.userId) {
      this.authContextService.invalidateContext(req.userId);
    }

    this.authCookieService.clearAllCookies(res);

    return { success: true };
  }
}