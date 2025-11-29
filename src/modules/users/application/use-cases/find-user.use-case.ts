import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../constants/user.tokens';
import type { IUserRepository } from '../../../../repositories/user/Iuser.repository';
import { SupportedLang, t } from '../../../../locales';
import type { NavbarUser } from '../../types/base-user-info';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';

@Injectable()
export class GetNavbarUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(userId: number, language: SupportedLang): Promise<NavbarUser> {
    const navUser = await this.userRepository.getNavbarUser(userId);

    if (!navUser) {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', language),
      });
    }

    const profile_img = navUser.profile_img
      ? this.firebaseService.getPublicUrl(navUser.profile_img)
      : null;

    return { ...navUser, profile_img };
  }
}