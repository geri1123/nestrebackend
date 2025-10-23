// src/auth/email-verification.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { AgencyRepository } from '../repositories/agency/agency.repository';
import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
import { EmailService } from '../email/email.service';
import { generateToken } from '../utils/hash';
import { SupportedLang, t } from '../locales';


@Injectable()
export class EmailVerificationService {
  constructor(
    private userRepo: UserRepository,
    private agencyRepo: AgencyRepository,
    private registrationRequestRepo: RegistrationRequestRepository,
    private emailService: EmailService,
  ) {}

  async verify(token: string, language: SupportedLang): Promise<void> {
   
     if (!token) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { token: [t('tokenRequired', language)] },
      });
    }

    // 2️⃣ Find user by token
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', language),
        errors: { token: [t('invalidOrExpiredToken', language)] },
      });
    }
 
    const emailVerified = true;
    const statusToUpdate = user.role === 'agent' ? 'pending' : 'active';
    await this.userRepo.verifyEmail(user.id, emailVerified, statusToUpdate);

    const safeFirstName = user.first_name ?? 'User';

    if (user.role === 'agent') {
      // Send Pending Approval Email
      await this.emailService.sendPendingApprovalEmail(user.email, safeFirstName);
    } else {
   
      await this.emailService.sendWelcomeEmail(user.email, safeFirstName);
    }

 
    if (user.role === 'agency_owner') {
      const agency = await this.agencyRepo.findByOwnerUserId(user.id);
      if (agency) await this.agencyRepo.activateAgency(agency.id);
    }
  }

  async resend(identifier: string, language: SupportedLang): Promise<void> {
  
  
  const user = await this.userRepo.findByIdentifier(identifier);
  if (!user) {
    throw new NotFoundException({
        success: false,
        message: t('validationFailed', language),
        errors: { email: [t('userNotFound', language)] },
      
  })
 
}
  if (user.email_verified) {
    throw new BadRequestException({
        success:false,
           message: t('validationFailed', language),
           errors:{email:[t('emailAlreadyVerified' , language)]}
    })
  }
  
    // Generate new verification token
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    await this.userRepo.regenerateVerificationToken(user.id, token, expires);

    await this.emailService.sendVerificationEmail(user.email, user.first_name ?? 'User', token, language);
  }
}
