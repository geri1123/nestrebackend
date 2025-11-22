import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRepository } from '../../../repositories/user/user.repository';
import { EmailService } from '../../../infrastructure/email/email.service';
import { BaseRegistrationDto } from '../../auth/dto/base-registration.dto';
import { UserStatus, UserCreationData } from '../../auth/types/create-user-input';
import { generateToken } from '../../../common/utils/hash';
import { t, SupportedLang } from '../../../locales';
import { CacheService } from '../../../infrastructure/cache/cache.service';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
    private readonly cacheService:CacheService,
  ) {}


private mapDtoToUserCreation(dto: BaseRegistrationDto, role: 'user' | 'agency_owner' | 'agent'): UserCreationData {
  return {
    username: dto.username,
    email: dto.email,
    password: dto.password,
    first_name: dto.first_name,
    last_name: dto.last_name,
    role,
    status: UserStatus.INACTIVE,  
  };
}
  
async registerUser(dto: BaseRegistrationDto, language: SupportedLang) {
  const errors = await this.checkUserExists(dto.username, dto.email, language);
  if (Object.keys(errors).length) throw new BadRequestException(errors);

  // Reuse createUserWithRole for all user types
  const { userId, verificationToken } = await this.createUserWithRole(dto, 'user', language);

  // Send verification email
  await this.emailService.sendVerificationEmail(
    dto.email,
    dto.first_name || dto.username,
    verificationToken,
    language
  );

  return { userId, message: t('registrationSuccess', language) };
}
  
  
 async createUserWithRole(
    dto: BaseRegistrationDto,
    role: 'user' | 'agency_owner' | 'agent',
    language: SupportedLang = 'al',
  ) {
    const userData = this.mapDtoToUserCreation(dto, role);
    const userId = await this.userRepo.create(userData);

    // Generate verification token
    const verificationToken = generateToken();
  const cacheKey = `email_verification:${verificationToken}`;

  // const result = await this.cacheService.set(cacheKey,  { userId, role }, 24 * 60 * 60 * 1000);
  const result = await this.cacheService.set(cacheKey, { userId, role },30 * 60 * 1000);
    console.log(`[CACHE SET] ${cacheKey}`);
  console.log(`[CACHE SET] Data: userId=${userId}, role=${role}, success=${result}`);

    return { userId, verificationToken };
  }

  async checkUserExists(username: string, email: string, language: SupportedLang) {
    const errors: Record<string, string[]> = {};
    if (await this.userRepo.usernameExists(username)) errors.username = [t('usernameExists', language)];
    if (await this.userRepo.emailExists(email)) errors.email = [t('emailExists', language)];
    return errors;
  }
}
