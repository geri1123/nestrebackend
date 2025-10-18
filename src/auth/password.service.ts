import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { PasswordResetTokenRepository } from '../repositories/passwordReset/password-reset.repository';
import { EmailService } from '../email/email.service';
import { comparePassword, hashPassword, generateToken } from '../utils/hash';

import { SupportedLang ,t} from '../locales';
@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string, lang: SupportedLang): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException({ email: [t('userNotFound', lang)] });
    }

    if (user.status !== 'active') {
      throw new ForbiddenException({ email: [t('accountNotActive', lang)] });
    }

    // Delete existing tokens
    await this.tokenRepository.deleteByUserId(user.id);

    // Generate new token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
      throw new BadRequestException({ token: [t('invalidToken', lang)] });
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException({ token: [t('tokenExpired', lang)] });
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
        newPassword: [t('passwordSameAsCurrent', lang)] 
      });
    }

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);
    await this.userRepository.updateFieldsById(user.id, { password: hashedPassword });

    // Delete used token
    await this.tokenRepository.delete(token);
  }
}