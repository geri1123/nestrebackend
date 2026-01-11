import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { USERS_REPOSITORY_TOKENS } from '../../../users/domain/repositories/user.repository.tokens';
import {USER_REPO, type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { generateToken } from '../../../../common/utils/hash';
import { SupportedLang, t } from '../../../../locales';
import { Prisma } from '@prisma/client';

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
   @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(
    data: RegisterUserData,
    lang: SupportedLang,
    role: 'user' | 'agent' | 'agency_owner' = 'user',
    tx?: Prisma.TransactionClient
  ) {
    const errors: Record<string, string[]> = {};

    if (await this.userRepo.usernameExists(data.username))
      errors.username = [t('usernameExists', lang)];

    if (await this.userRepo.emailExists(data.email))
      errors.email = [t('emailExists', lang)];

    if (Object.keys(errors).length > 0)
      throw new BadRequestException({ success: false, errors });

    const userId = await this.userRepo.create({
      ...data,
      role,
      status: 'inactive',
    
    }, tx);

    const token = generateToken();

    await this.cacheService.set(
      `email_verification:${token}`,
      { userId, role },
      30 * 60 * 1000
    );
   
    await this.emailService.sendVerificationEmail(
      data.email,
      data.first_name || data.username,
      token,
      lang,
    );

    return { userId, token };
  }
}