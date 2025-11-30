import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { t, SupportedLang } from '../../../../locales';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';

@Injectable()
export class GetUserProfileUseCase {
  constructor(  
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserDomainRepository,) {}

  async execute(userId: number, language: SupportedLang = 'al'): Promise<User> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', language),
        errors: { user: [t('userNotFound', language)] },
      });
    }

    return user;
  }
}