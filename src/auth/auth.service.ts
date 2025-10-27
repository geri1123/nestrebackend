
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { AgencyService } from '../agency/agency.service';
import { RegistrationRequestService } from '../registration-request/registration.request.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterAgencyOwnerDto } from './dto/register-agency-owner.dto';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { SupportedLang, t } from '../locales';
import { comparePassword } from '../utils/hash';
import { BaseRegistrationDto } from './dto/base-registration.dto';
import { RegistrationService } from '../users/RegistrationService';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly agencyService: AgencyService,
    private readonly jwtService: JwtService,
    private readonly registrationrequestservice: RegistrationRequestService,
    private readonly registerservice:RegistrationService,
  ) {}

  // --------------------------
  // LOGIN
  // --------------------------
  async login(dto: LoginDto, language: SupportedLang = 'al') {
    const { identifier, password, rememberMe } = dto;

    const user = await this.userService.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: t('invalidCredentials', language),
      });
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException({
        success: false,
        message: t('accountNotActive', language),
        errorCode: 'EMAIL_NOT_VERIFIED',
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        success: false,
        message: t('invalidCredentials', language),
      });
    }

    await this.userService.updateLastLogin(user.id);

    const tokenExpiry = rememberMe ? '30d' : '1d';
    const token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      { expiresIn: tokenExpiry },
    );

    return { user, token };
  }

    async registerUser(dto: BaseRegistrationDto, lang: SupportedLang) {
    return this.registerservice.registerUser(dto, lang);
  }


  async registerAgencyOwner(dto: RegisterAgencyOwnerDto, language: SupportedLang) {
 

    
    const errors: Record<string, string[]> = {};

    
    const userErrors = await this.registerservice.checkUserExists(dto.username, dto.email, language);
    Object.assign(errors, userErrors);

    
    const agencyErrors = await this.agencyService.checkAgencyExists(dto.agency_name, dto.license_number, language);
    Object.assign(errors, agencyErrors);

  
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }

    const { userId, verificationToken } = await this.registerservice.createUserWithRole(
      dto,
      'agency_owner',
      language,
    );

   
    await this.agencyService.createAgency(dto, userId, language);

    
    await this.emailService.sendVerificationEmail(
      dto.email,
      dto.first_name || dto.username,
      verificationToken,
      language,
    );

    return {
      userId,
      message: t('registrationSuccess', language),
    };
  }

  async registerAgent(dto: RegisterAgentDto, language: SupportedLang) {
   
    const errors: Record<string, string[]> = {};

   
    const userErrors = await this.registerservice.checkUserExists(dto.username, dto.email, language);
    Object.assign(errors, userErrors);

   
    const agentErrors = await this.registrationrequestservice.checkAgentData(dto.public_code, dto.id_card_number, language);
    Object.assign(errors, agentErrors);

  
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }



    
    const { userId, verificationToken } = await this.registerservice.createUserWithRole(
      dto,
      'agent',
      language,
    );

   
    await this.registrationrequestservice.createAgentRequest(userId, dto, language);

 
    await this.emailService.sendVerificationEmail(
      dto.email,
      dto.first_name || dto.username,
      verificationToken,
      language,
    );

    return {
      userId,
      message: t('registrationSuccess', language),
    };
  }
}