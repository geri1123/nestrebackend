
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../users/services/users.service';
import { AgencyService } from '../agency/agency.service';
import { RegistrationRequestService } from '../registration-request/registration_request.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterAgencyOwnerDto } from './dto/register-agency-owner.dto';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { SupportedLang, t } from '../../locales';
import { comparePassword } from '../../common/utils/hash';
import { BaseRegistrationDto } from './dto/base-registration.dto';
import { RegistrationService } from '../users/services/RegistrationService';
import { throwValidationErrors } from '../../common/helpers/validation.helper';
import { validate } from 'class-validator';
import { AgentService } from '../agent/agent.service';
import { agency_status } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly agencyService: AgencyService,
    private readonly agentService:AgentService,
    private readonly jwtService: JwtService,
    private readonly registrationrequestservice: RegistrationRequestService,
    private readonly registerservice:RegistrationService,
  ) {}


async login(dto: LoginDto, language: SupportedLang = 'al') {
  const { identifier, password, rememberMe } = dto;

  // Find the user by identifier (username or email)
  const user = await this.userService.findByIdentifier(identifier);
  if (!user) {
    throw new UnauthorizedException({
      success: false,
      message: t('invalidCredentials', language),
    });
  }

  // Check if the user is active
  if (user.status !== 'active') {
    throw new UnauthorizedException({
      success: false,
      message: t('accountNotActive', language),
      errors: { general: [t('accountNotActive', language)] },
    });
  }

  // Check if the password matches
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedException({
      success: false,
      message: t('invalidCredentials', language),
    });
  }

 
  await this.userService.updateLastLogin(user.id);

  
  let agencyId: number | null = null;

  if (user.role === 'agency_owner') {
    
    const agency = await this.agencyService.getAgencyByOwnerOrFail(user.id ,language);
    if (agency) {
      agencyId = agency.id;
    }
  } else if (user.role === 'agent') {
    
    agencyId = await this.agentService.getAgencyIdForAgent(user.id); // use the service
  }

 
  const tokenExpiry = rememberMe ? '30d' : '1d';

  
  const token = this.jwtService.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      // role: user.role,
      // agencyId, 
    },
    { expiresIn: tokenExpiry },
  );

  return { user, token };
}



//======Regiser user=====////
 async registerUser(dto: BaseRegistrationDto, lang: SupportedLang) {
  const errors = await validate(dto);
  const extraErrors: Record<string, string[]> = {};

  if (dto.password !== dto.repeatPassword) {
    extraErrors.repeatPassword = [t('passwordsMismatch', lang)];
  }

  const dbErrors = await this.registerservice.checkUserExists(dto.username, dto.email, lang);
  Object.assign(extraErrors, dbErrors);

  if (errors.length > 0 || Object.keys(extraErrors).length > 0) {
    throwValidationErrors(errors, lang, extraErrors);
  }

  return this.registerservice.registerUser(dto, lang);
}
async registerAgencyOwner(dto: RegisterAgencyOwnerDto, lang: SupportedLang) {
  
  const errors = await validate(dto);
  const extraErrors: Record<string, string[]> = {};

  
  if (dto.password !== dto.repeatPassword) {
    extraErrors.repeatPassword = [t('passwordsMismatch', lang)];
  }

  
  const userErrors = await this.registerservice.checkUserExists(dto.username, dto.email, lang);
  Object.assign(extraErrors, userErrors);

  
  const agencyErrors = await this.agencyService.checkAgencyExists(dto.agency_name, dto.license_number, lang);
  Object.assign(extraErrors, agencyErrors);

  
  if (errors.length > 0 || Object.keys(extraErrors).length > 0) {
    throwValidationErrors(errors, lang, extraErrors);
  }

  
  const { userId, verificationToken } = await this.registerservice.createUserWithRole(
    dto,
    'agency_owner',
    lang
  );

  await this.agencyService.createAgency(dto, userId, lang , agency_status.inactive);

  await this.emailService.sendVerificationEmail(
    dto.email,
    dto.first_name || dto.username,
    verificationToken,
    lang
  );

  return {
    userId,
    message: t('registrationSuccess', lang),
  };
}

async registerAgent(dto: RegisterAgentDto, lang: SupportedLang) {

  const errors = await validate(dto);

 
  const extraErrors: Record<string, string[]> = {};


  if (dto.password !== dto.repeatPassword) {
    extraErrors.repeatPassword = [t('passwordsMismatch', lang)];
  }

 
  const userErrors = await this.registerservice.checkUserExists(dto.username, dto.email, lang);
  Object.assign(extraErrors, userErrors);

 
  const agentErrors = await this.registrationrequestservice.checkAgentData(
    dto.public_code,
    dto.id_card_number,
    lang
  );
  Object.assign(extraErrors, agentErrors);

  //  Throw all validation errors together
  if (errors.length > 0 || Object.keys(extraErrors).length > 0) {
    throwValidationErrors(errors, lang, extraErrors);
  }
  
  const { userId, verificationToken } = await this.registerservice.createUserWithRole(
    dto,
    'agent',
    lang,
  );

  await this.registrationrequestservice.createAgentRequest(userId, dto, lang);

  await this.emailService.sendVerificationEmail(
    dto.email,
    dto.first_name || dto.username,
    verificationToken,
    lang,
  );

  return {
    userId,
    message: t('registrationSuccess', lang),
  };
}

}