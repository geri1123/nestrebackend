import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { generateToken, hashPassword } from '../../../../common/utils/hash';
import { SupportedLang, t } from '../../../../locales';
import { Prisma, UserStatus } from '@prisma/client';
import { EmailQueueService } from '../../../../infrastructure/queue/services/email-queue.service';
 
export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  firstName: string | null;  
  lastName: string | null;   
}
 
export interface RegisterUserResult {
  userId: number;
  token: string;
  email: string;
  firstName: string;
  role: string;
}
 
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
  
    private readonly cacheService: CacheService,
    private readonly emailQueue:EmailQueueService
  ) {}
 
  async execute(
    data: RegisterUserData,
    lang: SupportedLang,
    role: 'user' | 'agent' | 'agency_owner' = 'user',
    tx?: Prisma.TransactionClient,
    skipEmailSending = false
  ): Promise<RegisterUserResult> {
    const errors: Record<string, string[]> = {};
 
    const normalizedUsername = data.username.replace(/\s+/g, "").toLowerCase();
 
    if (await this.userRepo.usernameExists(normalizedUsername)) {
      errors.username = [t("usernameExists", lang)];
    }
    
    if (await this.userRepo.emailExists(data.email)) {
      errors.email = [t('emailExists', lang)];
    }
 
    if (Object.keys(errors).length > 0) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', lang),
        errors,
      });
    }
 
    const hashedPassword = await hashPassword(data.password);
 
    const userId = await this.userRepo.create(
      {
        ...data,
        password: hashedPassword,
        username: normalizedUsername,
        role,
        status: UserStatus.pending,
      },
      tx
    );
 
    const token = generateToken();
 
    if (!skipEmailSending) {
      await this.sendVerificationEmail(userId, token, data.email, data.firstName || data.username, role, lang);
    }
 
    return {
      userId,
      token,
      email: data.email,
      firstName: data.firstName || data.username,
      role,
    };
  }
 
  async sendVerificationEmail(
    userId: number,
    token: string,
    email: string,
    firstName: string,
    role: string,
    lang: SupportedLang
  ): Promise<void> {
    await this.cacheService.set(
      `email_verification:${token}`,
      { userId, role },
      30 * 60 * 1000
    );
  await this.emailQueue.sendVerificationEmail(email, firstName, token , lang);
    // await this.emailService.sendVerificationEmail(
    //   email,
    //   firstName,
    //   token,
    //   lang,
    // );
  }
}