import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import {USERNAME_REPO, type IUsernameHistoryDomainRepository } from '../../domain/repositories/username-history.repository.interface';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { t, SupportedLang } from '../../../../locales';

@Injectable()
export class ChangeUsernameUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,

    @Inject(USERNAME_REPO)
    private readonly usernameHistoryRepository: IUsernameHistoryDomainRepository,
    private readonly getUserProfile: GetUserProfileUseCase,
  ) {}

  async execute(
    userId: number,
    newUsername: string,
    language: SupportedLang = 'al',
  ): Promise<{ success: boolean; message: string }> {
    // Get user
    const user = await this.getUserProfile.execute(userId, language);

    if (user.username === newUsername) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { username: [t('sameUsername', language)] },
      });
    }

    const exists = await this.userRepository.usernameExists(newUsername);
    if (exists) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { username: [t('usernameExists', language)] },
      });
    }

    const lastChange = await this.usernameHistoryRepository.getLastUsernameChange(userId);
    if (lastChange && !user.canUpdateUsername(lastChange.nextUsernameUpdate, 60)) {
      const nextDate = lastChange.nextUsernameUpdate.toLocaleDateString();
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: { username: [t('usernameCooldown', language).replace('{date}', nextDate)] },
      });
    }

    // Calculate next update date
    const nextUpdateDate = new Date();
    nextUpdateDate.setDate(nextUpdateDate.getDate() + 60);

    // Save username history
    await this.usernameHistoryRepository.saveUsernameChange(
      userId,
      user.username,
      newUsername,
      nextUpdateDate,
    );

    // Update username
    await this.userRepository.updateUsername(userId, newUsername);

    return {
      success: true,
      message: t('usernameChangedSuccessfully', language),
    };
  }
}