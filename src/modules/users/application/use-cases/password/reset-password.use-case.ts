import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { USERS_REPOSITORY_TOKENS } from "../../../domain/repositories/user.repository.tokens";
import {type IUserDomainRepository } from "../../../domain/repositories/user.repository.interface";
import { CacheService } from "../../../../../infrastructure/cache/cache.service";
import { SupportedLang, t } from "../../../../../locales";
import { comparePassword } from "../../../../../common/utils/hash";

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepo: IUserDomainRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(token: string, newPassword: string, lang: SupportedLang): Promise<void> {
    const cacheKey = `password_reset:${token}`;
    const cached = await this.cacheService.get<{ userId: number }>(cacheKey);

    if (!cached) {
      throw new BadRequestException({
        success: false,
        message: t('invalidOrExpiredToken', lang),
      });
    }

    const userWithPassword = await this.userRepo.findByIdWithPassword(cached.userId);

    if (!userWithPassword) {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', lang),
      });
    }

    const isSamePassword = await comparePassword(newPassword, userWithPassword.password);
    if (isSamePassword) {
      throw new BadRequestException({
        success: false,
        message: t('passwordSameAsCurrent', lang),
      });
    }

    await this.userRepo.updatePassword(cached.userId, newPassword);
    await this.cacheService.delete(cacheKey);
  }
}