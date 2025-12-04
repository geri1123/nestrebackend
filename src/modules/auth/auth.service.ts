
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';

import { EmailService } from '../../infrastructure/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterAgencyOwnerDto } from '../registration/dto/register-agency-owner.dto';
import { RegisterAgentDto } from '../registration/dto/register-agent.dto';
import { SupportedLang, t } from '../../locales';
import { comparePassword } from '../../common/utils/hash';
import { BaseRegistrationDto } from '../registration/dto/base-registration.dto';

import { throwValidationErrors } from '../../common/helpers/validation.helper';
import { validate } from 'class-validator';
import { RegisterUserUseCase } from '../registration/application/use-cases/register-user.use-case';
import { RegisterAgencyOwnerUseCase } from '../registration/application/use-cases/register-agency-owner.use-case';
import { RegisterAgentUseCase } from '../registration/application/use-cases/register-agent.use-case';
import { FindUserByIdentifierUseCase } from '../users/application/use-cases/find-user-by-identifier.use-case';
import { UpdateLastLoginUseCase } from '../users/application/use-cases/update-last-login.use-case';
import { FindUserByIdUseCase } from '../users/application/use-cases/find-user-by-id.use-case';
import { FindUserForAuthUseCase } from '../users/application/use-cases/find-user-for-auth.use-case';
export interface CustomJwtPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
  
    private readonly emailService: EmailService,
    
    private readonly registerUserUseCase:RegisterUserUseCase,
     private readonly registerAgencyOwnerUseCase:RegisterAgencyOwnerUseCase,
     private readonly registerAgentUseCase:RegisterAgentUseCase,
    private readonly jwtService: JwtService,
    private readonly findUserForAuthUseCase: FindUserForAuthUseCase,
    private readonly updateLastLoginUseCase:UpdateLastLoginUseCase,
    private readonly findUserByIdUseCase:FindUserByIdUseCase,
  ) {}
   
    private generateJwt(user: any, expiresIn: string | number = '1d'): string {
    const payload = {
      userId: Number(user.id),
      username: String(user.username),
      email: String(user.email),
      role: String(user.role),
    };

 
    return this.jwtService.sign(payload as any, { 
      expiresIn: expiresIn as any 
    });
  }
async login(dto: LoginDto, lang: SupportedLang = 'al') {
  const { identifier, password, rememberMe } = dto;

  const authUser = await this.findUserForAuthUseCase.execute(identifier);
  if (!authUser) throw new UnauthorizedException({message:t('invalidCredentials', lang)});

  if (authUser.status !== 'active')
    throw new UnauthorizedException( {message: t('accountNotActive', lang)});

  const isMatch = await comparePassword(password, authUser.password);
  if (!isMatch) throw new UnauthorizedException({ message: t('accountNotActive', lang)});

  // Now load domain-safe User for return + JWT payload
  const user = await this.findUserByIdUseCase.execute(authUser.id, lang);

  await this.updateLastLoginUseCase.execute(authUser.id);

  const token = this.generateJwt(user, rememberMe ? '30d' : '1d');

  return { user, token };
}


async refreshTokenAfterRoleChange(userId: number, lang: SupportedLang) {
  const user = await this.findUserByIdUseCase.execute(userId, lang);
  const token = this.generateJwt(user, '1d');
  return { user, token };
}
async registerUser(dto: BaseRegistrationDto, lang: SupportedLang) {
  const errors = await validate(dto);

  if (dto.password !== dto.repeatPassword) {
    throwValidationErrors(errors, lang, {
      repeatPassword: [t('passwordsMismatch', lang)],
    });
  }

  if (errors.length > 0) {
    throwValidationErrors(errors, lang);
  }

  return this.registerUserUseCase.execute(dto, lang, 'user');
}

async registerAgencyOwner(dto: RegisterAgencyOwnerDto, lang: SupportedLang) {
  const errors = await validate(dto);
  if (dto.password !== dto.repeatPassword)
    throwValidationErrors(errors, lang, { repeatPassword: [t('passwordsMismatch', lang)] });
  if (errors.length > 0) {
    throwValidationErrors(errors, lang);
  }
  return this.registerAgencyOwnerUseCase.execute(dto, lang);
}

async registerAgent(dto: RegisterAgentDto, lang: SupportedLang) {
  const errors = await validate(dto);
  if (dto.password !== dto.repeatPassword)
    throwValidationErrors(errors, lang, { repeatPassword: [t('passwordsMismatch', lang)] });
  if (errors.length > 0) {
    throwValidationErrors(errors, lang);
  }
  return this.registerAgentUseCase.execute(dto, lang);
}

}