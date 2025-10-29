import { Injectable, BadRequestException } from '@nestjs/common';
import { UserService } from './users.service';
import { UsernameHistoryRepository } from '../../repositories/usernamehistory/usernamehistory.repository';
import { t, SupportedLang } from '../../locales';

@Injectable()
export class UsernameService {
  constructor(
    private readonly userService: UserService,
    private readonly usernameHistoryRepo: UsernameHistoryRepository,
  ) {}
 private async checkUsernameCooldown(userId: number, language: SupportedLang): Promise<void> {
    const lastChange = await this.usernameHistoryRepo.getLastUsernameChange(userId);
    const now = new Date();

    if (lastChange && lastChange.next_username_update > now) {
      throw new BadRequestException({
        success: false,
        message: t('validationFailed', language),
        errors: {
          username: [t('TooManyUsernameRequestsError', language)],
        },
      });
    }
  }

  async changeUsername(
    userId: number,
    newUsername: string,
    language: SupportedLang = 'al',
  ): Promise<{ success: boolean; message: string; nextChangeAllowed: Date }> {

    const user = await this.userService.findByIdOrFail(userId, language);

    await this.userService.usernameExists(newUsername, language);

    
     await this.checkUsernameCooldown(userId, language);
    
    const oldUsername = user.username;
    await this.userService.updateFields(userId, { username: newUsername });

const now = new Date();
    const nextUpdateDate = new Date();
    nextUpdateDate.setDate(now.getDate() + 10); // 10-day cooldown
    await this.usernameHistoryRepo.saveUsernameChange(userId, oldUsername, newUsername, nextUpdateDate);

    
    return {
      success: true,
      message: t('successfullyUpdatedUsername', language), 
      nextChangeAllowed: nextUpdateDate,
    };
  }
}
