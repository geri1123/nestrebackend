import {
  Controller, Post, Body, HttpStatus, HttpCode, BadRequestException,
  Req,
  Res,
  UseGuards,
  
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { BaseRegistrationDto } from './dto/base-registration.dto';
import { RegisterAgencyOwnerDto } from './dto/register-agency-owner.dto';
import { RegisterAgentDto } from './dto/register-agent.dto';
import type { SupportedLang } from '../../locales';
import {  plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../common/helpers/validation.helper';
import type { Response } from 'express'
import type { RequestWithLang } from '../../middlewares/language.middleware';
import { LoginDto} from './dto/login.dto';
import { t } from '../../locales';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AuthSwagger } from './swagger/auth.swagger';


@Public()
@Controller('auth')

export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @AuthSwagger.Login()
  @Post('login')
@Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
@UseGuards(CustomThrottlerGuard)
@HttpCode(HttpStatus.OK)
async login(
  @Body() body: Record<string, any>,
  @Req() req: RequestWithLang,
  @Res({ passthrough: true }) res: Response,
) {
  const lang: SupportedLang = req.language || 'al';

  const dto = plainToInstance(LoginDto, body);

  const errors = await validate(dto);
  if (errors.length > 0) throwValidationErrors(errors, lang);

  const { user, token } = await this.authService.login(dto, lang);

  const maxAge = dto.rememberMe
    ? 30 * 24 * 60 * 60 * 1000 // 30 days
    : 24 * 60 * 60 * 1000; // 1 day

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
  });

  return {
    success: true,
    message: t("loginSuccess", lang),
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
  @HttpCode(HttpStatus.CREATED)
 

async registerUser(@Body() body: Record<string, any>, @Req() req: RequestWithLang) {
  const lang = req.language || 'al';
  const dto = plainToInstance(BaseRegistrationDto, body);
  return this.authService.registerUser(dto, lang);
}

@AuthSwagger.RegisterAgencyOwner()
  @Post('register/agency_owner')
  @HttpCode(HttpStatus.CREATED)
 
async registerAgencyOwner(@Body() body: Record<string, any>, @Req() req: RequestWithLang) {
  const lang = req.language || 'al';
  const dto = plainToInstance(RegisterAgencyOwnerDto, body);
  return this.authService.registerAgencyOwner(dto, lang);
}
@AuthSwagger.RegisterAgent()
  @Post('register/agent')
  @HttpCode(HttpStatus.CREATED)
  
  async registerAgent(@Body() body: Record<string, any>, @Req() req: RequestWithLang) {
  const lang = req.language || 'al';
  const dto = plainToInstance(RegisterAgentDto, body);

  return this.authService.registerAgent(dto, lang);
}
}
