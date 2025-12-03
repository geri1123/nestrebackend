import { BadRequestException, Injectable } from "@nestjs/common";
import { CacheService } from "../../../../../infrastructure/cache/cache.service";
import { SupportedLang, t } from "../../../../../locales";

@Injectable()
export class VerifyPasswordResetTokenUseCase {
  constructor(private readonly cacheService: CacheService) {}

  async execute(token: string, lang: SupportedLang): Promise<boolean> {
    const cached = await this.cacheService.get(`password_reset:${token}`);

    if (!cached) {
      throw new BadRequestException({
        success: false,
        message: t('invalidOrExpiredToken', lang),
      });
    }

    return true;
  }
}
