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
//email
    private readonly email: EmailService,

    //user
    
       private readonly findUserById: FindUserByIdUseCase,
   private readonly findrequestsbyuserid: FindRequestsByUserIdUseCase,
   private readonly verifyEmail: VerifyUserEmailUseCase,
    //agency
        private readonly activateAgencyByOwner: ActivateAgencyByOwnerUseCase,
    private readonly getAgencyWithOwner: GetAgencyWithOwnerByIdUseCase, 
    //reg-req
    private readonly setUnderReview: SetUnderReviewUseCase,
    //notification
    private readonly notifications: NotificationService,
    private readonly templates: NotificationTemplateService,
  ) {}


  async execute(token: string, lang: SupportedLang) {
  if (!token) {
    throw new BadRequestException({ errors: { token: [t('tokenRequired', lang)] } });
  }

  // 1️⃣ Validate token from cache (must stay outside transaction)
  const cacheKey = `email_verification:${token}`;
  const cached = await this.cache.get<{ userId: number; role: string }>(cacheKey);

  if (!cached) {
    throw new BadRequestException({ errors: { token: [t('invalidOrExpiredToken', lang)] } });
  }

  const { userId, role } = cached;

  // 2️⃣ Run all DB operations inside one transaction
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

  // 3️⃣ Actions AFTER transaction (side effects)
  await this.cache.delete(cacheKey);

  const name = user.firstName ?? 'User';
  role === 'agent'
    ? await this.email.sendPendingApprovalEmail(user.email, name)
    : await this.email.sendWelcomeEmail(user.email, name);

  if (role === 'agent') {
    await this.handleAgentProcessAfterCommit(user, lang);
  }
}

private async handleAgentProcessAfterCommit(user: any, lang: SupportedLang) {
  const requests = await this.findrequestsbyuserid.execute(user.id, lang);
  if (!requests?.length) throw new BadRequestException({ errors: { registration: ['No request'] } });

  const agencyId = requests[0]?.agencyId;
  if (!agencyId) throw new BadRequestException({ message: t('agencyNotFound', lang) });

  const agency = await this.getAgencyWithOwner.execute(agencyId, lang);

  const translations = this.templates.getAllTranslations('agent_email_confirmed', user);

  await this.notifications.sendNotification({
    userId: agency.owner_user_id,
    type: 'agent_email_confirmed',
    translations,
  });
}

}
//   async execute(token: string, lang: SupportedLang) {
//     if (!token) {
//       throw new BadRequestException({ errors: { token: [t('tokenRequired', lang)] } });
//     }

//     const cacheKey = `email_verification:${token}`;
//     const cached = await this.cache.get<{ userId: number; role: string }>(cacheKey);

//     if (!cached) {
//       throw new BadRequestException({ errors: { token: [t('invalidOrExpiredToken', lang)] } });
//     }

//     const { userId, role } = cached;

//     const user = await this.findUserById.execute(userId, lang);

//     if (role === 'agency_owner') {
//      await this.activateAgencyByOwner.execute(userId, lang);
//     }

//     const newStatus = role === 'agent' ? 'pending' : 'active';
//     await this.verifyEmail.execute(userId,  newStatus);

//     if (role === 'agent') {
//       await this.handleAgentProcess(user, userId, lang);
//     }

//     await this.cache.delete(cacheKey);

//     const name = user.firstName ?? 'User';
//     role === 'agent'
//       ? await this.email.sendPendingApprovalEmail(user.email, name)
//       : await this.email.sendWelcomeEmail(user.email, name);
//   }

//   private async handleAgentProcess(user: any, userId: number, lang: SupportedLang) {
//    await this.setUnderReview.execute(userId, lang);

//     const requests = await this.findrequestsbyuserid.execute(userId , lang);
//     if (!requests?.length) throw new BadRequestException({ errors: { registration: ['No request'] } });

//    const agencyId = requests[0]?.agencyId;
//    if (!agencyId) {
//   throw new BadRequestException({
//     message: t('agencyNotFound', lang),
//   });
// }

//     const agency = await this.getAgencyWithOwner.execute(agencyId,lang);

//     const translations = this.templates.getAllTranslations('agent_email_confirmed', user);

//     await this.notifications.sendNotification({
//       userId: agency.owner_user_id,
//       type: 'agent_email_confirmed',
//       translations,
//     });
//   }
// }


