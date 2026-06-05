import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from '../../../../infrastructure/redis/cache.service';
import { SupportedLang, t } from '../../../../locales';
import { NotificationService } from '../../../notification/notification.service';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { FindRequestByUserIdUseCase } from '../../../registration-request/application/use-cases/find-requests-by-user-id.use-case';
import { GetAgencyWithOwnerByIdUseCase } from '../../../agency/application/use-cases/get-agency-with-owner-byid.use-case';
import { SetUnderReviewUseCase } from '../../../registration-request/application/use-cases/set-under-review.use-case';
import { ActivateAgencyByOwnerUseCase } from '../../../agency/application/use-cases/activate-agency-by-owner.use-case';
import { VerifyUserEmailUseCase } from '../../../users/application/use-cases/verify-user-email.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import {
  EMAIL_EVENTS,
  EmailWelcomeEvent,
  EmailPendingApprovalEvent,
} from '../../../../infrastructure/events/email/email.events';
import { EmailQueueService } from '../../../../infrastructure/queue/services/email-queue.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly findUserById: FindUserByIdUseCase,
    private readonly findrequestsbyuserid: FindRequestByUserIdUseCase,
    private readonly verifyEmail: VerifyUserEmailUseCase,
    private readonly activateAgencyByOwner: ActivateAgencyByOwnerUseCase,
    private readonly getAgencyWithOwner: GetAgencyWithOwnerByIdUseCase,
    private readonly setUnderReview: SetUnderReviewUseCase,
    private readonly notifications: NotificationService,
    private readonly emailQueue: EmailQueueService,
  ) {}

  async execute(token: string, lang: SupportedLang) {
    if (!token) {
      throw new BadRequestException({
        errors: { token: [t('tokenRequired', lang)] },
      });
    }

    const cacheKey = `email_verification:${token}`;
    const cached = await this.cache.get<{ userId: number; role: string }>(cacheKey);

    if (!cached) {
      const usedTokenKey = `email_verification_used:${token}`;
      const wasUsed = await this.cache.get<{ userId: number }>(usedTokenKey);

      if (wasUsed) {
        // Token was already used - check if email is verified
        const user = await this.findUserById.execute(wasUsed.userId, lang);

        if (user?.emailVerified) {
          return { alreadyVerified: true };
        }
      }

      throw new BadRequestException({
        errors: { token: [t('invalidOrExpiredToken', lang)] },
        message: t('invalidOrExpiredToken', lang),
      });
    }

    const { userId, role } = cached;

    // Check if user is already verified
    const existingUser = await this.findUserById.execute(userId, lang);

    if (existingUser?.emailVerified) {
      await this.cache.delete(cacheKey);
      await this.cache.set(`email_verification_used:${token}`, { userId }, 60 * 60 * 24);
      return { alreadyVerified: true };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (role === 'agency_owner') {
        await this.activateAgencyByOwner.execute(userId, lang, tx);
      }

      const newStatus = role === 'agent' ? 'pending' : 'active';
      await this.verifyEmail.execute(userId, newStatus, tx);

      if (role === 'agent') {
        await this.setUnderReview.execute(userId, lang, tx);
      }

      return existingUser;
    });

    const user = result;

    await this.cache.delete(cacheKey);
    await this.cache.set(`email_verification_used:${token}`, { userId }, 60 * 60 * 24);

    const name = user.firstName ?? 'User';

    // if (role === 'agent') {
    //   this.eventEmitter.emit(
    //     EMAIL_EVENTS.PENDING_APPROVAL,
    //     new EmailPendingApprovalEvent(user.email, name),
    //   );
    // } else {
    //   this.eventEmitter.emit(
    //     EMAIL_EVENTS.WELCOME,
    //     new EmailWelcomeEvent(user.email, name),
    //   );
    // }
    if (role === 'agent') {
  await this.emailQueue.sendPendingApprovalEmail(user.email, name);
} else {
  await this.emailQueue.sendWelcomeEmail(user.email, name);
}

    if (role === 'agent') {
      await this.handleAgentProcessAfterCommit(user, lang);
    }

    return { alreadyVerified: false };
  }

  private async handleAgentProcessAfterCommit(user: any, lang: SupportedLang) {
    const request = await this.findrequestsbyuserid.execute(user.id, lang);
    if (!request) {
      throw new BadRequestException({
        errors: { registration: ['No request'] },
      });
    }

    if (!request.agencyId) {
      throw new BadRequestException({
        message: t('agencyNotFound', lang),
      });
    }

    const agency = await this.getAgencyWithOwner.execute(request.agencyId, lang);

    await this.notifications.sendNotification({
      userId: agency.owner_user_id,
      type: 'agent_email_confirmed',
      templateData: user,
    });
  }
}