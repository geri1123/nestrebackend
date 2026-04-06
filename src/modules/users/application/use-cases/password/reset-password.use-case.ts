import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../../domain/repositories/user.repository.interface';
import { CacheService } from '../../../../../infrastructure/cache/cache.service';
import { SupportedLang, t } from '../../../../../locales';
import { comparePassword, hashPassword } from '../../../../../common/utils/hash';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly cacheService: CacheService,
  ) {}

  async execute(token: string, newPassword: string, lang: SupportedLang): Promise<{ success: boolean; message: string }> {
    const cacheKey = `password_reset:${token}`;
    const cached = await this.cacheService.get<{ userId: number }>(cacheKey);

    if (!cached) {
      throw new BadRequestException({
        success: false,
        message: t('invalidOrExpiredToken', lang),
      });
    }

    const userWithPassword = await this.userRepo.findByIdWithPassword(cached.userId);
    const fullUser = await this.userRepo.findById(cached.userId);

    if (!userWithPassword || !fullUser) {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', lang),
      });
    }

    // If user is a Google user and has no password yet, allow setting a new one
    if (!userWithPassword.password) {
      const hashed = await hashPassword(newPassword);
      await this.userRepo.updatePassword(cached.userId, hashed);
      await this.cacheService.delete(cacheKey);

      return { success: true, message: t('passwordCreatedSuccessfully', lang) };
    }

    // Prevent resetting to the same password
    const isSamePassword = await comparePassword(newPassword, userWithPassword.password);
    if (isSamePassword) {
      throw new BadRequestException({
        success: false,
        message: t('passwordSameAsCurrent', lang),
      });
    }

    const hashed = await hashPassword(newPassword);
    await this.userRepo.updatePassword(cached.userId, hashed);
    await this.cacheService.delete(cacheKey);

    return { success: true, message: t('passwordChangedSuccessfully', lang) };
  }
}