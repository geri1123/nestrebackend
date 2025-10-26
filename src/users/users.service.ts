import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { EmailService } from '../email/email.service';
import { BaseRegistrationDto } from '../auth/dto/base-registration.dto';
import { UserStatus, UserCreationData } from '../auth/types/create-user-input';
import { generateToken, hashPassword } from '../utils/hash';
import { t, SupportedLang } from '../locales';
import { UserStatusType } from './types/base-user-info';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}
    async findByIdentifierOrFail(identifier: string, language: SupportedLang) {
    const user = await this.userRepo.findByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', language),
        errors: { email: [t('userNotFound', language)] },
      });
    }
    return user;
  }
    async regenerateVerificationToken(userId: number): Promise<string> {
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await this.userRepo.regenerateVerificationToken(userId, token, expires);

    return token;
  }
  //
  async updatePassword(userId: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return this.userRepo.updateFieldsById(userId, { password: hashedPassword });
}
  //
  async findByEmailOrFailActive(email: string, lang: SupportedLang) {
  const user = await this.userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundException({ email: [t('userNotFound', lang)] });
  }
  if (user.status !== 'active') {
    throw new ForbiddenException({ email: [t('accountNotActive', lang)] });
  }
  return user;
}
async verifyEmail(
  userId: number,
  emailVerified: boolean,
  statusToUpdate: UserStatusType
) {
  return this.userRepo.verifyEmail(userId, emailVerified, statusToUpdate);
}
  async findByIdentifier(identifier: string) {
    return this.userRepo.findByIdentifier(identifier);
  }
 async findByVerificationTokenOrFail(token: string) {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    return user;
  }
  async updateLastLogin(userId: number) {
    return this.userRepo.updateFieldsById(userId, { last_login: new Date() });
  }

  async checkUserExists(
    username: string,
    email: string,
    language: SupportedLang
  ): Promise<Record<string, string[]>> {
    const errors: Record<string, string[]> = {};

    if (await this.userRepo.usernameExists(username)) {
      errors.username = [t('usernameExists', language)];
    }

    if (await this.userRepo.emailExists(email)) {
      errors.email = [t('emailExists', language)];
    }

    return errors;
  }

  private mapDtoToUserCreation(
    dto: BaseRegistrationDto,
    role: 'user' | 'agency_owner' | 'agent'
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
  // USER REGISTRATION (regular user)
  // --------------------------
  async registerUser(dto: BaseRegistrationDto, language: SupportedLang) {
    console.log('👤 [UserService] Registering regular user');

    // Check first
    const errors = await this.checkUserExists(dto.username, dto.email, language);
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException(errors);
    }

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
  // CREATE USER WITH SPECIFIC ROLE
  // Used by AuthService after validation
  // --------------------------
  async createUserWithRole(
    dto: BaseRegistrationDto,
    role: 'user' | 'agency_owner' | 'agent',
    language: SupportedLang,
  ): Promise<{ userId: number; verificationToken: string }> {
    console.log(`👤 [UserService] Creating user with role: ${role}`);

    const userData = this.mapDtoToUserCreation(dto, role);
    const userId = await this.userRepo.create(userData);

    

    return {
      userId,
      verificationToken: userData.verification_token
    };
  }
}