
import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { generateToken } from '../../../../common/utils/hash';
import { SupportedLang, t } from '../../../../locales';
import { Prisma, user_status } from '@prisma/client';

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
}

export interface RegisterUserResult {
  userId: number;
  token: string;
  email: string;
  firstName: string;
  role: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    data: RegisterUserData,
    lang: SupportedLang,
    role: 'user' | 'agent' | 'agency_owner' = 'user',
    tx?: Prisma.TransactionClient,
    skipEmailSending = false
  ): Promise<RegisterUserResult> {
    const errors: Record<string, string[]> = {};

    const normalizedUsername = data.username.replace(/\s+/g, "").toLowerCase();

    if (await this.userRepo.usernameExists(normalizedUsername)) {
      errors.username = [t("usernameExists", lang)];
    }
    
    if (await this.userRepo.emailExists(data.email)) {
      errors.email = [t('emailExists', lang)];
    }

    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors,
      });
    }

    const userId = await this.userRepo.create(
      {
        ...data,
        username: normalizedUsername,
        role,
        status: user_status.pending,
      },
      tx
    );

    const token = generateToken();

    if (!skipEmailSending) {
      await this.sendVerificationEmail(userId, token, data.email, data.first_name || data.username, role, lang);
    }

    return {
      userId,
      token,
      email: data.email,
      firstName: data.first_name || data.username,
      role,
    };
  }

  async sendVerificationEmail(
    userId: number,
    token: string,
    email: string,
    firstName: string,
    role: string,
    lang: SupportedLang
  ): Promise<void> {
    await this.cacheService.set(
      `email_verification:${token}`,
      { userId, role },
      30 * 60 * 1000
    );

    await this.emailService.sendVerificationEmail(
      email,
      firstName,
      token,
      lang,
    );
  }
}