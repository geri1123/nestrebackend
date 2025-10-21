// registration.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { AgencyRepository } from '../repositories/agency/agency.repository';
import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
import { EmailService } from '../email/email.service';
import { comparePassword, generateToken } from '../utils/hash';
import { t, SupportedLang } from '../locales';
import { BaseRegistrationDtoFactory } from './dto/base-registration.dto';
import { RegisterAgencyOwnerDtoFactory } from './dto/register-agency-owner.dto';
import { RegisterAgentDtoFactory } from './dto/register-agent.dto';
import { UserStatus } from './types/create-user-input';
import { UserCreationData } from './types/create-user-input';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RegisterAgencyOwnerDto } from './dto/register-agency-owner.dto';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { BaseRegistrationDto } from './dto/base-registration.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly agencyRepo: AgencyRepository,
    private readonly requestRepo: RegistrationRequestRepository,
    private readonly emailService: EmailService,
    private readonly jwtService:JwtService
  ) {}
//Login
async login(dto: LoginDto, language: SupportedLang="al") {
    const { identifier, password, rememberMe } = dto;

    // Find user by email or username
    const user = await this.userRepo.findByIdentifier(identifier);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: t('invalidCredentials', language),
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw new UnauthorizedException({
        success: false,
        message: t('accountNotActive', language),
        errorCode: 'EMAIL_NOT_VERIFIED',
      });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        success: false,
        message: t('invalidCredentials', language),
      });
    }

    // Update last login timestamp
    await this.userRepo.updateFieldsById(user.id, {
      last_login: new Date(),
    });

    // Generate JWT token with appropriate expiry
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
  // --------------------------
  // COMMON VALIDATIONS
  // --------------------------
  private async validateUserBase(
    dto: BaseRegistrationDto,
    language: SupportedLang,
  ) {
    const errors: Record<string, string[]> = {};

    if (await this.userRepo.usernameExists(dto.username)) {
      errors.username = [t('usernameExists', language)];
    }

    if (await this.userRepo.emailExists(dto.email)) {
      errors.email = [t('emailExists', language)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }
  }

  // --------------------------
  // Helper to map DTO -> DB creation data
  // --------------------------
  private mapDtoToUserCreation(
    dto: BaseRegistrationDto,
    role: 'user' | 'agency_owner' | 'agent',
  ): UserCreationData {
    const verification_token = generateToken();
    const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return {
      username: dto.username,
      email: dto.email,
      password: dto.password,
      first_name: dto.first_name,
      last_name: dto.last_name,
      role,
      status: UserStatus.INACTIVE,
      verification_token,
      verification_token_expires,
    };
  }

  // --------------------------
  // USER REGISTRATION
  // --------------------------
  async registerUser(
    dto: BaseRegistrationDto,
    language: SupportedLang,
  ) {
    await this.validateUserBase(dto, language);

    const userData = this.mapDtoToUserCreation(dto, 'user');
    const userId = await this.userRepo.create(userData);

    await this.emailService.sendVerificationEmail(
      dto.email,
      dto.username,
      userData.verification_token,
      language,
    );

    return { userId, message: t('registrationSuccess', language) };
  }

  // --------------------------
  // AGENCY OWNER REGISTRATION
  // --------------------------
  async registerAgencyOwner(
    dto: RegisterAgencyOwnerDto,
    language: SupportedLang,
  ) {
    await this.validateUserBase(dto, language);
    const errors: Record<string, string[]> = {};

    if (await this.agencyRepo.agencyNameExist(dto.agency_name)) {
      errors.agency_name = [t('agencyExists', language)];
    }

    if (await this.agencyRepo.licenseExists(dto.license_number)) {
      errors.license_number = [t('licenseExists', language)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }

    const userData = this.mapDtoToUserCreation(dto, 'agency_owner');
    const userId = await this.userRepo.create(userData);

    await this.agencyRepo.create({
      agency_name: dto.agency_name,
      license_number: dto.license_number,
      address: dto.address,
      owner_user_id: userId,
    });

    await this.emailService.sendVerificationEmail(
      dto.email,
      `${dto.first_name} ${dto.last_name}`,
      userData.verification_token,
      language,
    );

    return { userId, message: t('registrationSuccess', language) };
  }

  // --------------------------
  // AGENT REGISTRATION
  // --------------------------
  async registerAgent(
    dto: RegisterAgentDto,
    language: SupportedLang,
  ) {
    await this.validateUserBase(dto, language);
    const errors: Record<string, string[]> = {};

    const agency = await this.agencyRepo.findByPublicCode(dto.public_code);
    if (!agency) {
      errors.public_code = [t('invalidPublicCode', language)];
    }

    if (await this.requestRepo.idCardExists(dto.id_card_number)) {
      errors.id_card_number = [t('idCardExists', language)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }

    const userData = this.mapDtoToUserCreation(dto, 'agent');
    const userId = await this.userRepo.create(userData);

    await this.requestRepo.create({
      userId,
      idCardNumber: dto.id_card_number,
      status: 'pending',
      agencyName: agency!.agency_name, 
      agencyId: agency!.id,
      requestedRole: dto.requested_role,
      requestType: 'agent_license_verification',
    });

    await this.emailService.sendVerificationEmail(
      dto.email,
      `${dto.first_name} ${dto.last_name}`,
      userData.verification_token,
      language,
    );

    return { userId, message: t('registrationSuccess', language) };
  }
}