// // registration.service.ts
// import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
// import { UserRepository } from '../repositories/user/user.repository';
// import { AgencyRepository } from '../repositories/agency/agency.repository';
// import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
// import { EmailService } from '../email/email.service';
// import { comparePassword, generateToken } from '../utils/hash';
// import { t, SupportedLang } from '../locales';
// import { BaseRegistrationDtoFactory } from './dto/base-registration.dto';
// import { RegisterAgencyOwnerDtoFactory } from './dto/register-agency-owner.dto';
// import { RegisterAgentDtoFactory } from './dto/register-agent.dto';
// import { UserStatus } from './types/create-user-input';
// import { UserCreationData } from './types/create-user-input';
// import { LoginDto } from './dto/login.dto';
// import { JwtService } from '@nestjs/jwt';
// import { RegisterAgencyOwnerDto } from './dto/register-agency-owner.dto';
// import { RegisterAgentDto } from './dto/register-agent.dto';
// import { BaseRegistrationDto } from './dto/base-registration.dto';
// import { RegistrationRequestService } from '../registration-request/registration.request.service';
// import { AgencyService } from '../agency/agency.service';
// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly userRepo: UserRepository,
   
//     private readonly emailService: EmailService,
//     private readonly agencyService:AgencyService,
//     private readonly jwtService:JwtService,
//     private  readonly registrationrequest:RegistrationRequestService,

//   ) {}
// //Login
// async login(dto: LoginDto, language: SupportedLang="al") {
//     const { identifier, password, rememberMe } = dto;

//     // Find user by email or username
//     const user = await this.userRepo.findByIdentifier(identifier);
//     if (!user) {
//       throw new UnauthorizedException({
//         success: false,
//         message: t('invalidCredentials', language),
//       });
//     }

//     // Check if account is active
//     if (user.status !== 'active') {
//       throw new UnauthorizedException({
//         success: false,
//         message: t('accountNotActive', language),
//         errorCode: 'EMAIL_NOT_VERIFIED',
//       });
//     }

//     // Verify password
//     const isMatch = await comparePassword(password, user.password);
//     if (!isMatch) {
//       throw new UnauthorizedException({
//         success: false,
//         message: t('invalidCredentials', language),
//       });
//     }

//     // Update last login timestamp
//     await this.userRepo.updateFieldsById(user.id, {
//       last_login: new Date(),
//     });

//     // Generate JWT token with appropriate expiry
//     const tokenExpiry = rememberMe ? '30d' : '1d';
//     const token = this.jwtService.sign(
//       {
//         userId: user.id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//       { expiresIn: tokenExpiry },
//     );

//     return { user, token };
//   }
//   // --------------------------
//   // COMMON VALIDATIONS
//   // --------------------------
//   private async validateUserBase(
//     dto: BaseRegistrationDto,
//     language: SupportedLang,
//   ) {
//     const errors: Record<string, string[]> = {};

//     if (await this.userRepo.usernameExists(dto.username)) {
//       errors.username = [t('usernameExists', language)];
//     }

//     if (await this.userRepo.emailExists(dto.email)) {
//       errors.email = [t('emailExists', language)];
//     }

//     if (Object.keys(errors).length > 0) {
//       throw new BadRequestException(errors);
//     }
//   }

//   // --------------------------
//   // Helper to map DTO -> DB creation data
//   // --------------------------
//   private mapDtoToUserCreation(
//     dto: BaseRegistrationDto,
//     role: 'user' | 'agency_owner' | 'agent',
//   ): UserCreationData {
//     const verification_token = generateToken();
//     const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

//     return {
//       username: dto.username,
//       email: dto.email,
//       password: dto.password,
//       first_name: dto.first_name,
//       last_name: dto.last_name,
//       role,
//       status: UserStatus.INACTIVE,
//       verification_token,
//       verification_token_expires,
//     };
//   }

//   // --------------------------
//   // USER REGISTRATION
//   // --------------------------
//   async registerUser(
//     dto: BaseRegistrationDto,
//     language: SupportedLang,
//   ) {
//     await this.validateUserBase(dto, language);

//     const userData = this.mapDtoToUserCreation(dto, 'user');
//     const userId = await this.userRepo.create(userData);

//     await this.emailService.sendVerificationEmail(
//       dto.email,
//       dto.username,
//       userData.verification_token,
//       language,
//     );

//     return { userId, message: t('registrationSuccess', language) };
//   }

//   // --------------------------
//   // AGENCY OWNER REGISTRATION
//   // --------------------------
//     async registerAgencyOwner(dto: RegisterAgencyOwnerDto, language: SupportedLang) {
//     await this.validateUserBase(dto, language);

//     const userData = this.mapDtoToUserCreation(dto, "agency_owner");
//     const userId = await this.userRepo.create(userData);

//     // ✅ call AgencyService to handle agency creation
//     await this.agencyService.createAgency(dto, userId, language);

//     await this.emailService.sendVerificationEmail(
//       dto.email,
//       `${dto.first_name} ${dto.last_name}`,
//       userData.verification_token,
//       language,
//     );

//     return { userId, message: t("registrationSuccess", language) };
//   }
//   // --------------------------
//   // AGENT REGISTRATION
//   // --------------------------
//   async registerAgent(dto: RegisterAgentDto, language: SupportedLang) {
//   await this.validateUserBase(dto, language);

//   const userData = this.mapDtoToUserCreation(dto, 'agent');
//   const userId = await this.userRepo.create(userData);

//   // Delegate all request + notification logic to the service
//   await this.registrationrequest.createAgentRequest(userId, dto, language);

//   await this.emailService.sendVerificationEmail(
//     dto.email,
//     `${dto.first_name} ${dto.last_name}`,
//     userData.verification_token,
//     language,
//   );

//   return { userId, message: t('registrationSuccess', language) };
// }
// }
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

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly agencyService: AgencyService,
    private readonly jwtService: JwtService,
    private readonly registrationrequestservice: RegistrationRequestService,
    private readonly prisma: PrismaService, // Add PrismaService for transactions
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
    return this.userService.registerUser(dto, lang);
  }


  async registerAgencyOwner(dto: RegisterAgencyOwnerDto, language: SupportedLang) {
 

    
    const errors: Record<string, string[]> = {};

    
    const userErrors = await this.userService.checkUserExists(dto.username, dto.email, language);
    Object.assign(errors, userErrors);

    
    const agencyErrors = await this.agencyService.checkAgencyExists(dto.agency_name, dto.license_number, language);
    Object.assign(errors, agencyErrors);

  
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }

    console.log('✅ [AuthService] All checks passed, creating user and agency...');

   
    const { userId, verificationToken } = await this.userService.createUserWithRole(
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

   
    const userErrors = await this.userService.checkUserExists(dto.username, dto.email, language);
    Object.assign(errors, userErrors);

   
    const agentErrors = await this.registrationrequestservice.checkAgentData(dto.public_code, dto.id_card_number, language);
    Object.assign(errors, agentErrors);

  
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }



    
    const { userId, verificationToken } = await this.userService.createUserWithRole(
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