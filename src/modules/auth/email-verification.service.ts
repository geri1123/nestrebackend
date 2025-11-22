import { Injectable, BadRequestException } from '@nestjs/common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { UserService } from '../users/services/users.service';
import { AgencyService } from '../agency/agency.service';
import { EmailService } from '../../infrastructure/email/email.service';
import { RegistrationRequestService } from '../registration-request/registration_request.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationTemplateService } from '../notification/notifications-template.service';
import { SupportedLang, t } from '../../locales';
import { generateToken } from '../../common/utils/hash';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly cacheService: CacheService,  
    private readonly userService: UserService,
    private readonly agencyService: AgencyService,
    private readonly emailService: EmailService,
    private readonly registrationRequestService: RegistrationRequestService,
    private readonly notificationService: NotificationService,
    private readonly notificationTemplateService: NotificationTemplateService,
  ) {}

  async verify(token: string, language: SupportedLang): Promise<void> {
    if (!token) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { token: [t('tokenRequired', language)] },
      });
    }

    // Get from cache
    const cacheKey = `email_verification:${token}`;
    const cached = await this.cacheService.get<{ userId: number; role: string }>(cacheKey);

    console.log(`[CACHE HIT] key=${cacheKey}, data=`, cached);

    if (!cached) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { token: [t('invalidOrExpiredToken', language)] },
      });
    }

    const { userId, role } = cached;

    // Get user for email sending later
    const user = await this.userService.findByIdOrFail(userId, language);

    // Handle agency owner
    if (role === 'agency_owner') {
      await this.agencyService.activateAgencyByOwner(userId, language);
    }

    // Update user status
    const statusToUpdate = role === 'agent' ? 'pending' : 'active';
    await this.userService.verifyEmail(userId, true, statusToUpdate);

    // Handle agent notifications
    if (role === 'agent') {
      await this.handleAgentVerification(user, userId, language);
    }

    // Delete token from cache
    await this.cacheService.delete(cacheKey);
    console.log(`[CACHE DELETE] ${cacheKey}`);

    // Send appropriate email
    const safeFirstName = user.first_name ?? 'User';
    if (role === 'agent') {
      await this.emailService.sendPendingApprovalEmail(user.email, safeFirstName);
    } else {
      await this.emailService.sendWelcomeEmail(user.email, safeFirstName);
    }
  }
async resend(identifier: string, language: SupportedLang): Promise<void> {
  const user = await this.userService.findByIdentifierOrFail(identifier, language);

  // Already verified?
  if (user.email_verified) {
    throw new BadRequestException({
      success: false,
      message: t('validationFailed', language),
      errors: { email: [t('emailAlreadyVerified', language)] },
    });
  }

  // Only allow resending if user status is 'pending' or 'inactive'
  if (!['pending', 'inactive'].includes(user.status)) {
    throw new BadRequestException({
      success: false,
      message: t('validationFailed', language),
      errors: { status: [t('cannotResendTokenForCurrentStatus', language)] },
    });
  }

  // Generate new token
  const verificationToken = generateToken();
  const cacheKey = `email_verification:${verificationToken}`;

  // Store in cache with user's role
  await this.cacheService.set(
    cacheKey,
    { userId: user.id, role: user.role },
    30 * 60 * 1000,
  );

  console.log(`[CACHE SET] Resend: ${cacheKey}, userId=${user.id}, role=${user.role}`);

  // Send email
  await this.emailService.sendVerificationEmail(
    user.email,
    user.first_name ?? 'User',
    verificationToken,
    language,
  );
}
  private async handleAgentVerification(user: any, userId: number, language: SupportedLang) {
    await this.registrationRequestService.setUnderReview(userId, language);

    const requests = await this.registrationRequestService.getRequestsByUserId(userId);
    if (!requests?.length) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { registrationRequest: [t('noRegistrationRequest', language)] },
      });
    }

    const agencyId = requests[0].agency_id;
    if (!agencyId) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { agency: [t('noAgencyIdInRequest', language)] },
      });
    }

    const agency = await this.agencyService.getAgencyWithOwnerById(agencyId);
    if (!agency?.owner_user_id) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { agency: [t('agencyOrOwnerNotFound', language)] },
      });
    }

    const translations = this.notificationTemplateService.getAllTranslations('agent_email_confirmed', user);
    await this.notificationService.sendNotification({
      userId: agency.owner_user_id,
      type: 'agent_email_confirmed',
      translations,
    });
  }
}