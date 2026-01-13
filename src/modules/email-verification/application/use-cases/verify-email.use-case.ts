// import { BadRequestException, Injectable } from '@nestjs/common';
// import { CacheService } from '../../../../infrastructure/cache/cache.service';
// import { SupportedLang, t } from '../../../../locales';
// import { EmailService } from '../../../../infrastructure/email/email.service';
// import { NotificationService } from '../../../notification/notification.service';
// import { NotificationTemplateService } from '../../../notification/notifications-template.service';
// import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
// import { FindRequestsByUserIdUseCase } from '../../../registration-request/application/use-cases/find-requests-by-user-id.use-case';
// import { GetAgencyWithOwnerByIdUseCase } from '../../../agency/application/use-cases/get-agency-with-owner-byid.use-case';
// import { SetUnderReviewUseCase } from '../../../registration-request/application/use-cases/set-under-review.use-case';
// import { ActivateAgencyByOwnerUseCase } from '../../../agency/application/use-cases/activate-agency-by-owner.use-case';
// import { VerifyUserEmailUseCase } from '../../../users/application/use-cases/verify-user-email.use-case';
// import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

// @Injectable()
// export class VerifyEmailUseCase {
//   constructor(
//      private readonly prisma: PrismaService,
//     private readonly cache: CacheService,
// //email
//     private readonly email: EmailService,

//     //user
    
//        private readonly findUserById: FindUserByIdUseCase,
//    private readonly findrequestsbyuserid: FindRequestsByUserIdUseCase,
//    private readonly verifyEmail: VerifyUserEmailUseCase,
//     //agency
//         private readonly activateAgencyByOwner: ActivateAgencyByOwnerUseCase,
//     private readonly getAgencyWithOwner: GetAgencyWithOwnerByIdUseCase, 
//     //reg-req
//     private readonly setUnderReview: SetUnderReviewUseCase,
//     //notification
//     private readonly notifications: NotificationService,
//     private readonly templates: NotificationTemplateService,
//   ) {}


//   async execute(token: string, lang: SupportedLang) {
//   if (!token) {
//     throw new BadRequestException({ errors: { token: [t('tokenRequired', lang)] } });
//   }

  
//   const cacheKey = `email_verification:${token}`;
//   const cached = await this.cache.get<{ userId: number; role: string }>(cacheKey);

//   if (!cached) {
//     throw new BadRequestException({ errors: { token: [t('invalidOrExpiredToken', lang)] } });
//   }

//   const { userId, role } = cached;

 
//   const result = await this.prisma.$transaction(async (tx) => {

//     const user = await this.findUserById.execute(userId, lang);

//     if (role === 'agency_owner') {
//       await this.activateAgencyByOwner.execute(userId, lang, tx);
//     }

//     const newStatus = role === 'agent' ? 'pending' : 'active';
//     await this.verifyEmail.execute(userId, newStatus, tx);

//     if (role === 'agent') {
//       await this.setUnderReview.execute(userId, lang, tx);
//     }

//     return user;
//   });

//   const user = result;


//   await this.cache.delete(cacheKey);

//   const name = user.firstName ?? 'User';
//   role === 'agent'
//     ? await this.email.sendPendingApprovalEmail(user.email, name)
//     : await this.email.sendWelcomeEmail(user.email, name);

//   if (role === 'agent') {
//     await this.handleAgentProcessAfterCommit(user, lang);
//   }
// }

// private async handleAgentProcessAfterCommit(user: any, lang: SupportedLang) {
//   const requests = await this.findrequestsbyuserid.execute(user.id, lang);
//   if (!requests?.length) throw new BadRequestException({ errors: { registration: ['No request'] } });

//   const agencyId = requests[0]?.agencyId;
//   if (!agencyId) throw new BadRequestException({ message: t('agencyNotFound', lang) });

//   const agency = await this.getAgencyWithOwner.execute(agencyId, lang);

//   const translations = this.templates.getAllTranslations('agent_email_confirmed', user);

//   await this.notifications.sendNotification({
//     userId: agency.owner_user_id,
//     type: 'agent_email_confirmed',
//     translations,
//   });
// }

// }


// ============================================
// 1. UPDATED VERIFY EMAIL USE CASE
// ============================================

import { BadRequestException, Injectable } from '@nestjs/common';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { SupportedLang, t } from '../../../../locales';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { NotificationService } from '../../../notification/notification.service';
import { NotificationTemplateService } from '../../../notification/notifications-template.service';
import { FindUserByIdUseCase } from '../../../users/application/use-cases/find-user-by-id.use-case';
import { FindRequestsByUserIdUseCase } from '../../../registration-request/application/use-cases/find-requests-by-user-id.use-case';
import { GetAgencyWithOwnerByIdUseCase } from '../../../agency/application/use-cases/get-agency-with-owner-byid.use-case';
import { SetUnderReviewUseCase } from '../../../registration-request/application/use-cases/set-under-review.use-case';
import { ActivateAgencyByOwnerUseCase } from '../../../agency/application/use-cases/activate-agency-by-owner.use-case';
import { VerifyUserEmailUseCase } from '../../../users/application/use-cases/verify-user-email.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly email: EmailService,
    private readonly findUserById: FindUserByIdUseCase,
    private readonly findrequestsbyuserid: FindRequestsByUserIdUseCase,
    private readonly verifyEmail: VerifyUserEmailUseCase,
    private readonly activateAgencyByOwner: ActivateAgencyByOwnerUseCase,
    private readonly getAgencyWithOwner: GetAgencyWithOwnerByIdUseCase, 
    private readonly setUnderReview: SetUnderReviewUseCase,
    private readonly notifications: NotificationService,
    private readonly templates: NotificationTemplateService,
  ) {}

  async execute(token: string, lang: SupportedLang) {
    if (!token) {
      throw new BadRequestException({ 
        errors: { token: [t('tokenRequired', lang)] } 
      });
    }

    const cacheKey = `email_verification:${token}`;
    const cached = await this.cache.get<{ userId: number; role: string }>(cacheKey);

    // If token not in cache, check if it was already used
    if (!cached) {
      const usedTokenKey = `email_verification_used:${token}`;
      const wasUsed = await this.cache.get<{ userId: number }>(usedTokenKey);
      
      if (wasUsed) {
        // Token was already used - check if email is verified
        const user = await this.findUserById.execute(wasUsed.userId, lang);

        if (user?.emailVerified) {
          // Return success with alreadyVerified flag
          return { alreadyVerified: true };
        }
      }

      // Token truly invalid or expired
      throw new BadRequestException({ 
        errors: { token: [t('invalidOrExpiredToken', lang)] },
        message: t('invalidOrExpiredToken', lang)
      });
    }

    const { userId, role } = cached;

    // Check if user is already verified
    const existingUser = await this.findUserById.execute(userId, lang);
    
    if (existingUser?.emailVerified) {
      // Already verified - clean up and return success
      await this.cache.delete(cacheKey);
      await this.cache.set(`email_verification_used:${token}`, { userId }, 60 * 60 * 24); // 24 hours
      return { alreadyVerified: true };
    }

    // Proceed with verification
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await this.findUserById.execute(userId, lang);

      if (role === 'agency_owner') {
        await this.activateAgencyByOwner.execute(userId, lang, tx);
      }

      const newStatus = role === 'agent' ? 'pending' : 'active';
      await this.verifyEmail.execute(userId, newStatus, tx);

      if (role === 'agent') {
        await this.setUnderReview.execute(userId, lang, tx);
      }

      return user;
    });

    const user = result;

    // Clean up cache and mark token as used
    await this.cache.delete(cacheKey);
    await this.cache.set(`email_verification_used:${token}`, { userId }, 60 * 60 * 24); // 24 hours

    const name = user.firstName ?? 'User';
    role === 'agent'
      ? await this.email.sendPendingApprovalEmail(user.email, name)
      : await this.email.sendWelcomeEmail(user.email, name);

    if (role === 'agent') {
      await this.handleAgentProcessAfterCommit(user, lang);
    }

    return { alreadyVerified: false };
  }

  private async handleAgentProcessAfterCommit(user: any, lang: SupportedLang) {
    const requests = await this.findrequestsbyuserid.execute(user.id, lang);
    if (!requests?.length) {
      throw new BadRequestException({ 
        errors: { registration: ['No request'] } 
      });
    }

    const agencyId = requests[0]?.agencyId;
    if (!agencyId) {
      throw new BadRequestException({ 
        message: t('agencyNotFound', lang) 
      });
    }

    const agency = await this.getAgencyWithOwner.execute(agencyId, lang);

    const translations = this.templates.getAllTranslations('agent_email_confirmed', user);

    await this.notifications.sendNotification({
      userId: agency.owner_user_id,
      type: 'agent_email_confirmed',
      translations,
    });
  }
}
