// src/auth/email-verification.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { AgencyRepository } from '../repositories/agency/agency.repository';
import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
import { EmailService } from '../email/email.service';
import { generateToken } from '../utils/hash';
import { SupportedLang, t } from '../locales';
import { AgencyService } from '../agency/agency.service';


@Injectable()
export class EmailVerificationService {
  constructor(
    private userRepo: UserRepository,
    private agencyRepo: AgencyRepository,
   private agencyService:AgencyService,
    private emailService: EmailService,
  ) {}

async verify(token: string, language: SupportedLang): Promise<void> {
    console.log('🔍 [EmailVerification] Starting verification for token:', token);

    // 1️⃣ Validate token
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

    console.log('👤 [EmailVerification] User found:', { id: user.id, role: user.role, email: user.email });

    // 3️⃣ SPECIAL HANDLING FOR AGENCY_OWNER - Activate agency FIRST
    if (user.role === 'agency_owner') {
      console.log('🏢 [EmailVerification] User is agency_owner, activating agency FIRST');
      
      try {
        // Check if agency exists before proceeding
        const agencyCheck = await this.agencyRepo.findByOwnerUserId(user.id);
        console.log('🏢 [EmailVerification] Agency check result:', agencyCheck);

        if (!agencyCheck) {
          console.error('❌ [EmailVerification] CRITICAL: No agency found for agency_owner user:', user.id);
          throw new BadRequestException({
            success: false,
            message: t('agencyNotFound', language),
          });
        }

        // Activate the agency
        console.log('🏢 [EmailVerification] Activating agency ID:', agencyCheck.id);
        await this.agencyService.activateAgencyByOwner(user.id, language);
        console.log('✅ [EmailVerification] Agency activated successfully');
      } catch (error) {
        console.error('❌ [EmailVerification] Failed to activate agency:', error);
        throw error; // Re-throw to prevent user verification if agency activation fails
      }
    }

    // 4️⃣ Verify user email and update status
    const emailVerified = true;
    const statusToUpdate = user.role === 'agent' ? 'pending' : 'active';
    
    console.log('📧 [EmailVerification] Updating user verification:', {
      userId: user.id,
      emailVerified,
      statusToUpdate,
    });

    await this.userRepo.verifyEmail(user.id, emailVerified, statusToUpdate);
    console.log('✅ [EmailVerification] User verified successfully');

    // 5️⃣ Send appropriate email based on role
    const safeFirstName = user.first_name ?? 'User';

    if (user.role === 'agent') {
      console.log('📨 [EmailVerification] Sending pending approval email');
      await this.emailService.sendPendingApprovalEmail(user.email, safeFirstName);
    } else {
      console.log('📨 [EmailVerification] Sending welcome email');
      await this.emailService.sendWelcomeEmail(user.email, safeFirstName);
    }

    console.log('✅ [EmailVerification] Verification process completed for user:', user.id);
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
