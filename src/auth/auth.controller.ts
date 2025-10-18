import {
  Controller, Post, Body, HttpStatus, HttpCode, BadRequestException,
  Req
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import { RegisterUserSwaggerDto, RegisterAgencyOwnerSwaggerDto, RegisterAgentSwaggerDto } from './dto/register-all-roles.swagger.dto';
import { BaseRegistrationDtoFactory } from './dto/base-registration.dto';
import { RegisterAgencyOwnerDtoFactory } from './dto/register-agency-owner.dto';
import { RegisterAgentDtoFactory } from './dto/register-agent.dto';
import { SupportedLang } from '../locales';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../common/helpers/validation.helper';


@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('register/user')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterUserSwaggerDto })
   @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async registerUser(@Body() body: Record<string, any>, @Req() req: any) {
    const lang = (req.query.lang || 'al') as SupportedLang;
    const DtoClass = BaseRegistrationDtoFactory(lang);
    const dto = plainToClass(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    if (dto.password !== dto.repeatPassword) {
      throw new BadRequestException({ repeatPassword: ['Passwords do not match'] });
    }
    return this.registrationService.registerUser(dto, lang);
  }

  @Post('register/agency_owner')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterAgencyOwnerSwaggerDto })
   @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
  @ApiResponse({ status: 201, description: 'Agency owner successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async registerAgencyOwner(@Body() body: Record<string, any>, @Req() req: any) {
    const lang = (req.query.lang || 'al') as SupportedLang;
    const DtoClass = RegisterAgencyOwnerDtoFactory(lang);
    const dto = plainToClass(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    if (dto.password !== dto.repeatPassword) {
      throw new BadRequestException({ repeatPassword: ['Passwords do not match'] });
    }
    return this.registrationService.registerAgencyOwner(dto, lang);
  }

  @Post('register/agent')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: RegisterAgentSwaggerDto })
   @ApiQuery({ name: 'lang', required: false, description: 'Language', example: 'al' })
  @ApiResponse({ status: 201, description: 'Agent successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async registerAgent(@Body() body:Record<string, any>, @Req() req: any) {
    const lang = (req.query.lang || 'al') as SupportedLang;
    const DtoClass = RegisterAgentDtoFactory(lang);
    const dto = plainToClass(DtoClass, body);
    
    const errors = await validate(dto);
    if (errors.length > 0) throwValidationErrors(errors);

    if (dto.password !== dto.repeatPassword) {
      throw new BadRequestException({ repeatPassword: ['Passwords do not match'] });
    }
    return this.registrationService.registerAgent(dto, lang);
  }
}
// import {
//   Controller, Post, Body, Req, HttpStatus, HttpCode, BadRequestException, ValidationPipe
// } from '@nestjs/common';
// import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
// import { BaseRegistrationDtoFactory } from './dto/base-registration.dto';
// import { RegisterAgencyOwnerDtoFactory } from './dto/register-agency-owner.dto';
// import { RegisterAgentDtoFactory } from './dto/register-agent.dto';
// import type { RequestWithLang } from '../middlewares/language.middleware';
// import { RegistrationService } from './registration.service';
// import { SupportedLang } from '../locales';
// import { t } from '../locales';
// import { RegisterAgencyOwnerSwaggerDto, RegisterAgentSwaggerDto, RegisterUserSwaggerDto } from './dto/register-all-roles.swagger.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly registrationService: RegistrationService) {}

//   @Post('register')
//   @HttpCode(HttpStatus.CREATED)
//   @ApiBody({ type: RegisterUserSwaggerDto }) // if role = user
// @ApiBody({ type: RegisterAgencyOwnerSwaggerDto }) // if role = agency_owner
// @ApiBody({ type: RegisterAgentSwaggerDto }) // if role = agent
//   @ApiResponse({ status: 201, description: 'User successfully registered' })
//   @ApiResponse({ status: 400, description: 'Validation failed or invalid data' })
//   async register(@Body() dto: any, @Req() req: RequestWithLang) {
//     const lang: SupportedLang = req.language || 'al';

//     // Validate role first
//     if (!dto.role) {
//       throw new BadRequestException({ role: [t('invalidRole', lang)] });
//     }

//     // Select appropriate DTO factory
//     let DtoClass: any;
//     switch (dto.role) {
//       case 'user': 
//         DtoClass = BaseRegistrationDtoFactory(lang); 
//         break;
//       case 'agency_owner': 
//         DtoClass = RegisterAgencyOwnerDtoFactory(lang); 
//         break;
//       case 'agent': 
//         DtoClass = RegisterAgentDtoFactory(lang); 
//         break;
//       default: 
//         throw new BadRequestException({ role: [t('invalidRole', lang)] });
//     }

//     // Manual password match validation BEFORE DTO validation
//     if (dto.password && dto.repeatPassword && dto.password !== dto.repeatPassword) {
//       throw new BadRequestException({ 
//         repeatPassword: [t('passwordsMismatch', lang)] 
//       });
//     }

//     // Validate DTO structure
//     const validatedDto = await new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       exceptionFactory: (errors) => {
//         const formatted: Record<string, string[]> = {};
//         errors.forEach(err => {
//           formatted[err.property] = Object.values(err.constraints ?? {});
//         });
//         return new BadRequestException(formatted);
//       },
//     }).transform(dto, { type: 'body', metatype: DtoClass });

//     // Call appropriate service method
//     switch (dto.role) {
//       case 'user': 
//         return await this.registrationService.registerUser(validatedDto, lang);
//       case 'agency_owner': 
//         return await this.registrationService.registerAgencyOwner(validatedDto, lang);
//       case 'agent': 
//         return await this.registrationService.registerAgent(validatedDto, lang);
//       default:
//         throw new BadRequestException({ role: [t('invalidRole', lang)] });
//     }
//   }
// }