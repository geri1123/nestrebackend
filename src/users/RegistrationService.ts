import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { EmailService } from '../email/email.service';
import { BaseRegistrationDto } from '../auth/dto/base-registration.dto';
import { UserStatus, UserCreationData } from '../auth/types/create-user-input';
import { generateToken } from '../utils/hash';
import { t, SupportedLang } from '../locales';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService
  ) {}

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

  async registerUser(dto: BaseRegistrationDto, language: SupportedLang) {
    // Validate existence
    const errors = await this.checkUserExists(dto.username, dto.email, language);
    if (Object.keys(errors).length) throw new BadRequestException(errors);

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

  async createUserWithRole(dto: BaseRegistrationDto, role: 'user' | 'agency_owner' | 'agent', language:SupportedLang="al") {
    const userData = this.mapDtoToUserCreation(dto, role);
    const userId = await this.userRepo.create(userData);
    return { userId, verificationToken: userData.verification_token };
  }

  async checkUserExists(username: string, email: string, language: SupportedLang) {
    const errors: Record<string, string[]> = {};
    if (await this.userRepo.usernameExists(username)) errors.username = [t('usernameExists', language)];
    if (await this.userRepo.emailExists(email)) errors.email = [t('emailExists', language)];
    return errors;
  }
}