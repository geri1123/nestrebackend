
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SupportedLang, t } from '../locales';
import { AgencyService } from '../agency/agency.service';
import { UserService } from '../users/services/users.service';
import { RegistrationRequestService } from '../registration-request/registration.request.service';
import { NotificationService } from '../notification/notification.service';
import { LanguageCode } from '@prisma/client';
import { NotificationTemplateService } from '../notification/notifications-template.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private agencyService: AgencyService,
    private emailService: EmailService,
    private userservice: UserService,
    private notificationservice: NotificationService,
     private notificationTemplateService: NotificationTemplateService,
    private registrationRequestService: RegistrationRequestService
  ) {}

  async verify(token: string, language: SupportedLang): Promise<void> {
    const errors: Record<string, string[]> = {};

    if (!token) {
      errors.token = [t('tokenRequired', language)];
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors,
      });
    }

    const user = await this.userservice.findByVerificationTokenOrFail(token);

    if (!user) {
      errors.token = [t('invalidToken', language)];
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors,
      });
    }

    if (user.role === 'agency_owner') {
      try {
        await this.agencyService.activateAgencyByOwner(user.id, language);
      } catch (err) {
        errors.agency = [t('agencyActivationFailed', language)];
        throw new BadRequestException({
          success: false,
          message: t('validationFailed', language),
          errors,
        });
      }
    }

    const statusToUpdate = user.role === 'agent' ? 'pending' : 'active';
    await this.userservice.verifyEmail(user.id, true, statusToUpdate);

    if (user.role === 'agent') {
      try {
        await this.registrationRequestService.setUnderReview(user.id, language);

        const requests = await this.registrationRequestService.getRequestsByUserId(user.id);
        if (!requests || requests.length === 0) {
          errors.registrationRequest = [t('noRegistrationRequest', language)];
          throw new BadRequestException({
            success: false,
            message: t('validationFailed', language),
            errors,
          });
        }

        const latestRequest = requests[0];
        const agencyId = latestRequest.agency_id;
        if (!agencyId) {
          errors.agency = [t('noAgencyIdInRequest', language)];
          throw new BadRequestException({
            success: false,
            message: t('validationFailed', language),
            errors,
          });
        }

        const agency = await this.agencyService.getAgencyWithOwnerById(agencyId);
        if (!agency || !agency.owner_user_id) {
          errors.agency = [t('agencyOrOwnerNotFound', language)];
          throw new BadRequestException({
            success: false,
            message: t('validationFailed', language),
            errors,
          });
        }
const translations = this.notificationTemplateService.getAllTranslations(
  'agent_email_confirmed',
  user
);

await this.notificationservice.sendNotification({
  userId: agency.owner_user_id,
  type: 'agent_email_confirmed',
  translations,
});
       
      } catch (err) {
        errors.notification = [t('agentNotificationFailed', language)];
        throw new BadRequestException({
          success: false,
          message: t('validationFailed', language),
          errors,
        });
      }
    }

    const safeFirstName = user.first_name ?? 'User';
    if (user.role === 'agent') {
      await this.emailService.sendPendingApprovalEmail(user.email, safeFirstName);
    } else {
      await this.emailService.sendWelcomeEmail(user.email, safeFirstName);
    }
  }

  async resend(identifier: string, language: SupportedLang): Promise<void> {
    const errors: Record<string, string[]> = {};
    const user = await this.userservice.findByIdentifierOrFail(identifier, language);

    if (user.email_verified) {
      errors.email = [t('emailAlreadyVerified', language)];
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors,
      });
    }

    const token = await this.userservice.regenerateVerificationToken(user.id);
    await this.emailService.sendVerificationEmail(user.email, user.first_name ?? 'User', token, language);
  }
}



 // await this.notificationservice.sendNotification({
        //   userId: agency.owner_user_id,
        //   type: 'agent_email_confirmed',
        //   translations: [
        //     {
        //       languageCode: LanguageCode.al,
        //       message: `${user.first_name || 'Agent'} ${user.last_name || ''} ka konfirmuar email-in dhe dëshiron të bashkohet me agjensionin tuaj.`,
        //     },
        //     {
        //       languageCode: LanguageCode.en,
        //       message: `${user.first_name || 'Agent'} ${user.last_name || ''} has confirmed their email and wants to join your agency.`,
        //     },
        //     {
        //       languageCode: LanguageCode.it,
        //       message: `${user.first_name || 'Agent'} ${user.last_name || ''} ha confermato la propria email e desidera unirsi alla tua agenzia.`,
        //     },
        //   ],
        // });