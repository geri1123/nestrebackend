import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { USERNAME_REPO, type IUsernameHistoryDomainRepository } from '../../domain/repositories/username-history.repository.interface';
import { t, SupportedLang } from '../../../../locales';
import { UserUpdatedEvent } from '../../events/user-updated.event';
import { FindUserByIdUseCase } from './find-user-by-id.use-case'; // <-- use entity

@Injectable()
export class ChangeUsernameUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,

    @Inject(USERNAME_REPO)
    private readonly usernameHistoryRepository: IUsernameHistoryDomainRepository,
    
    private readonly findUserById: FindUserByIdUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: number,
    newUsername: string,
    language: SupportedLang = 'al',
  ): Promise<{ success: boolean; message: string }> {
    // Get the actual User entity
    const user = await this.findUserById.execute(userId, language);

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
    
    // Emit event to invalidate cache
    this.eventEmitter.emit(
      'user.updated',
      new UserUpdatedEvent(userId, { username: newUsername }),
    );
    
    return {
      success: true,
      message: t('usernameChangedSuccessfully', language),
    };
  }
}