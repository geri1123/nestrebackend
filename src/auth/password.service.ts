import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { PasswordResetTokenRepository } from '../repositories/passwordReset/password-reset.repository';
import { EmailService } from '../email/email.service';
import { comparePassword, hashPassword, generateToken } from '../utils/hash';

import { SupportedLang ,t} from '../locales';
import { AppConfigService } from '../config/config.service';
import { UserService } from '../users/users.service';
@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly userservice:UserService,
    private readonly config: AppConfigService,
  ) {}

  async requestPasswordReset(email: string, lang: SupportedLang): Promise<void> {
   const user = await this.userservice.findByEmailOrFailActive(email, lang);

    // Delete existing tokens
    await this.tokenRepository.deleteByUserId(user.id);

    // Generate new token
    const token = generateToken();
   const expiresAt = new Date(Date.now() + this.config.passwordResetTokenExpiration * 60 * 1000);

    await this.tokenRepository.create(user.id, token, expiresAt);

    // Send email
    await this.emailService.sendPasswordRecoveryEmail(
      user.email,
      user.first_name ?? 'User',
      token,
      lang,
      expiresAt,
    );
  }

  async resetPassword(
    token: string,
    newPassword: string,
    lang: SupportedLang,
  ): Promise<void> {
    const errors: Record<string, string[]> = {};

    const tokenRecord = await this.tokenRepository.findByToken(token);

    if (!tokenRecord) {
     throw new BadRequestException({
  success: false,
  message: t('validationFailed', lang),
  errors: {
    token: [t('invalidToken', lang)],
  },
});
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException({
         success: false,
         message: t('validationFailed', lang),
          errors: {
         token: [t('tokenExpired', lang)] 
          },
        });
    }

    const user = await this.userRepository.findByIdWithPassword(
      tokenRecord.userId,
    );

    if (!user) {
      throw new NotFoundException({ token: [t('userNotFound', lang)] });
    }

    // Check if new password is the same as current
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException({ 
        success: false,
        message: t('validationFailed', lang),
        errors: {
        newPassword: [t('passwordSameAsCurrent', lang)] 
        }
      });
    }

    // Hash and update password
    await this.userservice.updatePassword(user.id, newPassword);
    // Delete used token
    await this.tokenRepository.delete(token);
  }
}


