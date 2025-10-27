import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../repositories/user/user.repository';
import { generateToken, hashPassword } from '../utils/hash';
import { t, SupportedLang } from '../locales';
import { UserStatusType } from './types/base-user-info';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    
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
  async updatePassword(userId: number, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword);
  return this.userRepo.updateFieldsById(userId, { password: hashedPassword });
}
  //
  async findByEmailOrFailActive(email: string, lang: SupportedLang) {
  const user = await this.userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundException({ email: [t('userNotFound', lang)] });
  }
  if (user.status !== 'active') {
    throw new ForbiddenException({ email: [t('accountNotActive', lang)] });
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

  
}