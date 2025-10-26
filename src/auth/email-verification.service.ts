// src/auth/email-verification.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SupportedLang, t } from '../locales';
import { AgencyService } from '../agency/agency.service';
import { UserService } from '../users/users.service';
import { RegistrationRequestService } from '../registration-request/registration.request.service';
@Injectable()
export class EmailVerificationService {
  constructor(
    
   private agencyService:AgencyService,
    private emailService: EmailService,
    private userservice:UserService,
    private registrationRequestService:RegistrationRequestService
  ) {}

async verify(token: string, language: SupportedLang): Promise<void> {
   

   
    if (!token) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { token: [t('tokenRequired', language)] },
      });
    }

    const user = await this.userservice.findByVerificationTokenOrFail(token);

    if (user.role === 'agency_owner') {
      console.log('🏢 [EmailVerification] User is agency_owner, activating agency FIRST');
      
      try {
        
         const agency = await this.agencyService.getAgencyByOwnerOrFail(user.id, language);
     
        
        await this.agencyService.activateAgencyByOwner(user.id, language);
       
      } catch (error) {
        console.error('❌ [EmailVerification] Failed to activate agency:', error);
        throw error; 
      }
    }

   
    const emailVerified = true;
    const statusToUpdate = user.role === 'agent' ? 'pending' : 'active';
  
await this.userservice.verifyEmail(user.id, emailVerified, statusToUpdate);   
if (user.role === 'agent') {
   await this.registrationRequestService.setUnderReview(user.id, language );
  
}
    
    const safeFirstName = user.first_name ?? 'User';

    if (user.role === 'agent') {
    
      await this.emailService.sendPendingApprovalEmail(user.email, safeFirstName);
    } else {
     
      await this.emailService.sendWelcomeEmail(user.email, safeFirstName);
    }

    
  }
//resend
  async resend(identifier: string, language: SupportedLang): Promise<void> {
  
  
  const user = await this.userservice.findByIdentifierOrFail(identifier, language);

  if (user.email_verified) {
    throw new BadRequestException({
      success: false,
      message: t('validationFailed', language),
      errors: { email: [t('emailAlreadyVerified', language)] },
    });
  }
 
  const token = await this.userservice.regenerateVerificationToken(user.id);

    await this.emailService.sendVerificationEmail(user.email, user.first_name ?? 'User', token, language);
  }
}
