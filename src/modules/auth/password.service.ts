
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user/user.repository';
import { EmailService } from '../../infrastructure/email/email.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { comparePassword } from '../../common/utils/hash';
import { SupportedLang, t } from '../../locales';
import { AppConfigService } from '../../infrastructure/config/config.service';
import { UserService } from '../users/services/users.service';
import { generateToken } from '../../common/utils/hash';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
    private readonly userservice: UserService,
    private readonly config: AppConfigService,
  ) {}

  async requestPasswordReset(email: string, lang: SupportedLang): Promise<void> {
    const user = await this.userservice.findByEmailOrFailActive(email, lang);

    // Generate new token
    const token = generateToken();
    const cacheKey = `password_reset:${token}`;

    
    const ttl = 10 * 60 * 1000;//10min
    
    await this.cacheService.set(
      cacheKey,
      { 
        userId: user.id, 
        email: user.email,
        createdAt: new Date().toISOString() 
      },
      ttl
    );

    console.log(`[CACHE SET] Password reset token: ${cacheKey}, userId=${user.id}, TTL=${ttl}ms`);

    // Calculate expiration time for email
    const expiresAt = new Date(Date.now() + ttl);

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
    const cacheKey = `password_reset:${token}`;
    
    // Get token data from Redis
    const cached = await this.cacheService.get<{ 
      userId: number; 
      email: string; 
      createdAt: string 
    }>(cacheKey);

    console.log(`[CACHE HIT] key=${cacheKey}, data=`, cached);

    // Token not found or expired
    if (!cached) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors: {
          token: [t('invalidOrExpiredToken', lang)],
        },
      });
    }

    const { userId } = cached;

    // Get user with password
    const user = await this.userRepository.findByIdWithPassword(userId);

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', lang),
        errors: { token: [t('userNotFound', lang)] },
      });
    }

    // Check if new password is the same as current
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors: {
          newPassword: [t('passwordSameAsCurrent', lang)],
        },
      });
    }

    // Update password
    await this.userservice.updatePassword(user.id, newPassword);

    // Delete used token from Redis
    await this.cacheService.delete(cacheKey);
    console.log(`[CACHE DELETE] ${cacheKey}`);
  }

  /**
   * Optional: Verify token validity without resetting
   */
  async verifyToken(token: string, lang: SupportedLang): Promise<boolean> {
    const cacheKey = `password_reset:${token}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (!cached) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors: {
          token: [t('invalidOrExpiredToken', lang)],
        },
      });
    }
    
    return true;
  }
}

// import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
// import { UserRepository } from '../../repositories/user/user.repository';
// import { PasswordResetTokenRepository } from '../../repositories/passwordReset/password-reset.repository';
// import { EmailService } from '../../infrastructure/email/email.service';
// import { comparePassword, hashPassword, generateToken } from '../../common/utils/hash';

// import { SupportedLang , t } from '../../locales';
// import { AppConfigService } from '../../infrastructure/config/config.service';
// import { UserService } from '../users/services/users.service';
// @Injectable()
// export class PasswordRecoveryService {
//   constructor(
//     private readonly userRepository: UserRepository,
//     private readonly tokenRepository: PasswordResetTokenRepository,
//     private readonly emailService: EmailService,
//     private readonly userservice:UserService,
//     private readonly config: AppConfigService,
//   ) {}

//   async requestPasswordReset(email: string, lang: SupportedLang): Promise<void> {
//    const user = await this.userservice.findByEmailOrFailActive(email, lang);

//     // Delete existing tokens
//     await this.tokenRepository.deleteByUserId(user.id);

//     // Generate new token
//     const token = generateToken();
//    const expiresAt = new Date(Date.now() + this.config.passwordResetTokenExpiration * 60 * 1000);

//     await this.tokenRepository.create(user.id, token, expiresAt);

//     // Send email
//     await this.emailService.sendPasswordRecoveryEmail(
//       user.email,
//       user.first_name ?? 'User',
//       token,
//       lang,
//       expiresAt,
//     );
//   }

//   async resetPassword(
//     token: string,
//     newPassword: string,
//     lang: SupportedLang,
//   ): Promise<void> {
//     const errors: Record<string, string[]> = {};

//     const tokenRecord = await this.tokenRepository.findByToken(token);

//     if (!tokenRecord) {
//      throw new BadRequestException({
//   success: false,
//   message: t('validationFailed', lang),
//   errors: {
//     token: [t('invalidToken', lang)],
//   },
// });
//     }

//     if (tokenRecord.expiresAt < new Date()) {
//       throw new BadRequestException({
//          success: false,
//          message: t('validationFailed', lang),
//           errors: {
//          token: [t('tokenExpired', lang)] 
//           },
//         });
//     }

//     const user = await this.userRepository.findByIdWithPassword(
//       tokenRecord.userId,
//     );

//     if (!user) {
//       throw new NotFoundException({ token: [t('userNotFound', lang)] });
//     }

//     // Check if new password is the same as current
//     const isSamePassword = await comparePassword(newPassword, user.password);
//     if (isSamePassword) {
//       throw new BadRequestException({ 
//         success: false,
//         message: t('validationFailed', lang),
//         errors: {
//         newPassword: [t('passwordSameAsCurrent', lang)] 
//         }
//       });
//     }

//     // Hash and update password
//     await this.userservice.updatePassword(user.id, newPassword);
//     // Delete used token
//     await this.tokenRepository.delete(token);
//   }
// }


