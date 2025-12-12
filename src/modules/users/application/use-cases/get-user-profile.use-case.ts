import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { t, SupportedLang } from '../../../../locales';

@Injectable()
export class GetUserProfileUseCase {
  constructor(  
        @Inject(USER_REPO)
    
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