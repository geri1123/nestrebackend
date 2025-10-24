import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { EmailService } from '../email/email.service';
import { BaseRegistrationDto } from '../auth/dto/base-registration.dto';
import { UserStatus, UserCreationData } from '../auth/types/create-user-input';
import { generateToken } from '../utils/hash';
import { t, SupportedLang } from '../locales';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async findByIdentifier(identifier: string) {
    return this.userRepo.findByIdentifier(identifier);
  }

  async updateLastLogin(userId: number) {
    return this.userRepo.updateFieldsById(userId, { last_login: new Date() });
  }

  private async validateUserBase(dto: BaseRegistrationDto, language: SupportedLang) {
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

  private mapDtoToUserCreation(dto: BaseRegistrationDto, role: 'user' | 'agency_owner' | 'agent'): UserCreationData {
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
  // USER REGISTRATION (regular user)
  // --------------------------
  async registerUser(dto: BaseRegistrationDto, language: SupportedLang) {
    console.log('👤 [UserService] Registering regular user');
    await this.validateUserBase(dto, language);

    const userData = this.mapDtoToUserCreation(dto, 'user');
    const userId = await this.userRepo.create(userData);

    await this.emailService.sendVerificationEmail(
      dto.email,
      dto.first_name || dto.username,
      userData.verification_token,
      language,
    );

    return { userId, message: t('registrationSuccess', language) };
  }

  // --------------------------
  // CREATE USER WITH SPECIFIC ROLE (internal use)
  // Used by AuthService for agency_owner and agent registration
  // --------------------------
  async createUserWithRole(
    dto: BaseRegistrationDto,
    role: 'user' | 'agency_owner' | 'agent',
    language: SupportedLang,
    sendEmail: boolean = true
  ): Promise<{ userId: number; verificationToken: string }> {
    console.log(`👤 [UserService] Creating user with role: ${role}`);
    await this.validateUserBase(dto, language);

    const userData = this.mapDtoToUserCreation(dto, role);
    const userId = await this.userRepo.create(userData);

    console.log(`✅ [UserService] User created with ID: ${userId}, role: ${role}`);

    if (sendEmail) {
      await this.emailService.sendVerificationEmail(
        dto.email,
        dto.first_name || dto.username,
        userData.verification_token,
        language,
      );
    }

    return { 
      userId, 
      verificationToken: userData.verification_token 
    };
  }
}