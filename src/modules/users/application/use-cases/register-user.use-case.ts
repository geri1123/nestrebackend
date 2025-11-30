import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { generateToken } from '../../../../common/utils/hash';
import { t, SupportedLang } from '../../../../locales';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
       @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
        private readonly userRepository: IUserDomainRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    data: RegisterUserData,
    role: 'user' | 'agency_owner' | 'agent' = 'user',
    language: SupportedLang = 'al',
  ): Promise<{ userId: number; verificationToken: string; message?: string }> {
    // Check if user exists
    const errors: Record<string, string[]> = {};
    if (await this.userRepository.usernameExists(data.username)) {
      errors.username = [t('usernameExists', language)];
    }
    if (await this.userRepository.emailExists(data.email)) {
      errors.email = [t('emailExists', language)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({ success: false, message: t('validationFailed', language), errors });
    }

    // Create user
    const userId = await this.userRepository.create({
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      role,
      status: 'inactive',
    });

    // Generate verification token
    const verificationToken = generateToken();
    const cacheKey = `email_verification:${verificationToken}`;
    await this.cacheService.set(cacheKey, { userId, role }, 30 * 60 * 1000);

    // Send verification email (only for user role, not for internal registration)
    if (role === 'user') {
      await this.emailService.sendVerificationEmail(
        data.email,
        data.first_name || data.username,
        verificationToken,
        language,
      );

      return { userId, verificationToken, message: t('registrationSuccess', language) };
    }

    return { userId, verificationToken };
  }
}
