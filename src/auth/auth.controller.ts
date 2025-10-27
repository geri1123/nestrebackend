import {
  Controller, Post, Body, HttpStatus, HttpCode, BadRequestException,
  Req,
  Res,
  UseGuards,
  Query
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserSwaggerDto, RegisterAgencyOwnerSwaggerDto, RegisterAgentSwaggerDto } from './dto/register-all-roles.swagger.dto';
import { BaseRegistrationDtoFactory } from './dto/base-registration.dto';
import { RegisterAgencyOwnerDtoFactory } from './dto/register-agency-owner.dto';
import { RegisterAgentDtoFactory } from './dto/register-agent.dto';
import type { SupportedLang } from '../locales';
import { plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../common/helpers/validation.helper';
import type { Response } from 'express'

import { RegisterSuccessResponseDto } from './dto/register-all-roles.swagger.dto';
import { RegisterFailedResponseDto } from './dto/register-all-roles.swagger.dto';
import type { RequestWithLang } from '../middlewares/language.middleware';
import { LoginDtoFactory, LoginFailedResponseDto, LoginSuccessResponseDto, LoginSwaggerDto } from './dto/login.dto';
import { t } from '../locales';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('login') 

@Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } }) 
@UseGuards(CustomThrottlerGuard)
   @HttpCode(HttpStatus.OK) 
   @ApiBody({type:LoginSwaggerDto})
    @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
  @ApiResponse({ status: 201, description: 'User successfully registered' ,type:LoginSuccessResponseDto})
 @ApiResponse({
  status: 400,
  description: 'Validation failed',
  type: LoginFailedResponseDto,
})
  async login(
    @Body() body: Record<string, any>,
   @Query('lang') lang: SupportedLang = 'al',
   
    @Res({ passthrough: true }) res: Response,
  ) {
    // const lang: SupportedLang = req.language || 'al';
    const DtoClass = LoginDtoFactory(lang);
    const dto = plainToInstance(DtoClass, body);

    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

   
    const { user, token } = await this.authService.login(dto, lang);

    
    const maxAge = dto.rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 24 * 60 * 60 * 1000; // 1 day

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge,
      path: '/',
    });

    return {
      success: true,
      message: t("loginSuccess" , lang),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }



  @Post('register/user')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterUserSwaggerDto }) 
   @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
  @ApiResponse({ status: 201, description: 'User successfully registered',type:RegisterSuccessResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' , type:RegisterFailedResponseDto })
  async registerUser(@Body() body: Record<string, any>,  @Req() req: RequestWithLang) {
    const lang = req.language;
    const DtoClass = BaseRegistrationDtoFactory(lang);
    const dto = plainToInstance(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    if (dto.password !== dto.repeatPassword) {
      throw new BadRequestException({ repeatPassword: ['Passwords do not match'] });
    }
    return this.authService.registerUser(dto, lang);
  }

  @Post('register/agency_owner')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterAgencyOwnerSwaggerDto })
   @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
 @ApiResponse({ status: 201, description: 'Agency successfully registered',type:RegisterSuccessResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' , type:RegisterFailedResponseDto })
  async registerAgencyOwner(@Body() body: Record<string, any>,@Req() req: RequestWithLang) {
   const lang=req.language;
    const DtoClass = RegisterAgencyOwnerDtoFactory(lang);
    const dto = plainToInstance(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    if (dto.password !== dto.repeatPassword) {
      throw new BadRequestException({ repeatPassword: ['Passwords do not match'] });
    }
    return this.authService.registerAgencyOwner(dto, lang);
  }

  @Post('register/agent')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterAgentSwaggerDto })
   @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
@ApiResponse({ status: 201, description: 'Agent successfully registered',type:RegisterSuccessResponseDto })
  @ApiResponse({ status: 400, description: 'Validation failed' , type:RegisterFailedResponseDto })
  async registerAgent(@Body() body:Record<string, any>, @Query('lang') lang: SupportedLang = 'al', @Req() req: any) {
    // const lang = (req.query.lang || 'al') as SupportedLang;
    const DtoClass = RegisterAgentDtoFactory(lang);
    const dto = plainToInstance(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    if (dto.password !== dto.repeatPassword) {
      throw new BadRequestException({ repeatPassword: ['Passwords do not match'] });
    }
    return this.authService.registerAgent(dto, lang);
  }
}
