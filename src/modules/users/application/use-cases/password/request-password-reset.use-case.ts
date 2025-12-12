import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {USER_REPO, type IUserDomainRepository } from "../../../domain/repositories/user.repository.interface";
import { USERS_REPOSITORY_TOKENS } from "../../../domain/repositories/user.repository.tokens";
import { EmailService } from "../../../../../infrastructure/email/email.service";
import { CacheService } from "../../../../../infrastructure/cache/cache.service";
import { SupportedLang, t } from "../../../../../locales";
import { generateToken } from "../../../../../common/utils/hash";

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
      @Inject(USER_REPO)
   
    private readonly userRepo: IUserDomainRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(email: string, lang: SupportedLang): Promise<void> {
    const user = await this.userRepo.findByEmail(email);

    if (!user || user.status !== 'active') {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', lang),
      });
    }

    const token = generateToken();
    const ttl = 10 * 60 * 1000;

    await this.cacheService.set(
      `password_reset:${token}`,
      { userId: user.id, email: user.email },
      ttl
    );

    const expiresAt = new Date(Date.now() + ttl);

    await this.emailService.sendPasswordRecoveryEmail(
      user.email,
      user.firstName ?? 'User',
      token,
      lang,
      expiresAt,
    );
  }
}