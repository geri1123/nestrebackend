import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user/user.repository';
import { generateToken, hashPassword } from '../../utils/hash';
import { t, SupportedLang } from '../../locales';
import { UserStatusType } from '../types/base-user-info';
import { UpdatableUserFields } from '../types/update-user-info';
import { FirebaseService } from '../../firebase/firebase.service';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
     private readonly firebaseService: FirebaseService
  ) {}
    async findByIdentifierOrFail(identifier: string, language: SupportedLang) {
    const user = await this.userRepo.findByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', language),
        errors: { email: [t('userNotFound', language)] },
      });
    }
    return user;
  }
    async regenerateVerificationToken(userId: number): Promise<string> {
    const token = generateToken();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await this.userRepo.regenerateVerificationToken(userId, token, expires);

    return token;
  }
  //
  async findByIdOrFail(userId: number, lang: SupportedLang) {
  const user = await this.userRepo.findById(userId);
  if (!user) {
    throw new NotFoundException({
      success: false,
      message: t('validationFailed', lang),
      errors: { 
      user: [t('userNotFound', lang)]
      },
     });
  
  }
  return user;
}
async usernameExists(username: string , language:SupportedLang="al"): Promise<boolean> {
    const exist = await this.userRepo.usernameExists(username);
    if (exist) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed',language),
        errors: {
        username: [t('usernameExists',language)]
        }
      });
    }
    return true; 
  }
  async updateFields(
  userId: number,
  fields: Partial<UpdatableUserFields>
): Promise<void> {
  return this.userRepo.updateFieldsById(userId, fields);
}
  //
  async updatePassword(userId: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return this.userRepo.updateFieldsById(userId, { password: hashedPassword });
}
  //
  async findByEmailOrFailActive(email: string, lang: SupportedLang) {
  const user = await this.userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundException({
      success: false,
      message: t('validationFailed', lang),
      errors: {
        email: [t('userNotFound', lang)],
      },
    });
  }

  if (user.status !== 'active') {
    throw new ForbiddenException({
      success: false,
      message: t('validationFailed', lang),
      errors: {
        email: [t('accountNotActive', lang)],
      },
    });
  }
  return user;
}
async verifyEmail(
  userId: number,
  emailVerified: boolean,
  statusToUpdate: UserStatusType
) {
  return this.userRepo.verifyEmail(userId, emailVerified, statusToUpdate);
}
  async findByIdentifier(identifier: string) {
    return this.userRepo.findByIdentifier(identifier);
  }
 async findByVerificationTokenOrFail(token: string) {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    return user;
  }
  async updateLastLogin(userId: number) {
    return this.userRepo.updateFieldsById(userId, { last_login: new Date() });
  }

 async updateProfileImage(userId: number, imageUrl: string) {
  await this.userRepo.updateProfileImage(userId, imageUrl);
}

async getNavbarUser(
  userId: number,
  language: SupportedLang = "al"
): Promise<{ username: string; email: string; profile_img: string | null; last_login: Date | null } | null> {
  
  const navusers = await this.userRepo.getNavbarUser(userId); 

  if (!navusers) {
    throw new NotFoundException({
      success: false,
      message: t('userNotFound', language),
    });
  }

  const publicUrl = navusers.profile_img
    ? this.firebaseService.getPublicUrl(navusers.profile_img)
    : null;

  return {
    ...navusers,
    profile_img: publicUrl,
  };
}
}