import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../constants/user.tokens';
import {type IUserRepository } from '../../../../repositories/user/Iuser.repository';
import { SupportedLang,t } from '../../../../locales';

@Injectable()
export class EnsureUsernameAvailabilityUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(username: string, language: SupportedLang): Promise<void> {
    const exists = await this.userRepository.usernameExists(username);
    if (exists) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { username: [t('usernameExists', language)] },
      });
    }
  }
}