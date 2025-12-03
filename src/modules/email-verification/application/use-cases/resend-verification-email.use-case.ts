import { BadRequestException, Injectable } from '@nestjs/common';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { SupportedLang, t } from '../../../../locales';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { generateToken } from '../../../../common/utils/hash';
import { FindUserForVerificationUseCase } from '../../../users/application/use-cases/find-user-for-verification.use-case';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
   private readonly finduserforverification: FindUserForVerificationUseCase,
    private readonly cache: CacheService,
    private readonly email: EmailService,
  ) {}

  async execute(identifier: string, lang: SupportedLang) {
    const user = await this.finduserforverification.execute(identifier, lang);

    if (user.email_verified) {
      throw new BadRequestException({ errors: { email: [t('emailAlreadyVerified', lang)] } });
    }

    if (!['pending', 'inactive'].includes(user.status)) {
      throw new BadRequestException({ errors: { status: [t('cannotResendTokenForCurrentStatus', lang)] } });
    }

    const token = generateToken();

    await this.cache.set(
      `email_verification:${token}`,
      { userId: user.id, role: user.role },
      30 * 60 * 1000,
    );

    await this.email.sendVerificationEmail(user.email, user.first_name ?? 'User', token, lang);
  }
}