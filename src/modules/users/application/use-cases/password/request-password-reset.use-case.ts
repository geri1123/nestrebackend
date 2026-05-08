import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  USER_REPO,
  type IUserDomainRepository,
} from '../../../domain/repositories/user.repository.interface';
import { CacheService } from '../../../../../infrastructure/cache/cache.service';
import { SupportedLang, t } from '../../../../../locales';
import { generateToken } from '../../../../../common/utils/hash';
import {
  EMAIL_EVENTS,
  EmailPasswordResetRequestedEvent,
} from '../../../../../infrastructure/events/email/email.events';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(email: string, lang: SupportedLang): Promise<void> {
    const user = await this.userRepo.findByEmail(email);

    if (!user || user.status !== 'active') {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', lang),
        errors: {
          email: [t('userNotFound', lang)],
        },
      });
    }

    const token = generateToken();
    const ttl = 10 * 60 * 1000;

    await this.cacheService.set(
      `password_reset:${token}`,
      { userId: user.id, email: user.email },
      ttl,
    );

    const expiresAt = new Date(Date.now() + ttl);

    this.eventEmitter.emit(
      EMAIL_EVENTS.PASSWORD_RESET_REQUESTED,
      new EmailPasswordResetRequestedEvent(
        user.email,
        user.firstName ?? 'User',
        token,
        lang,
        expiresAt,
      ),
    );
  }
}