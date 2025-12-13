import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { NavbarUser } from '../../domain/value-objects/navbar-user.vo';
import { FirebaseService } from '../../../../infrastructure/firebase/firebase.service';
import { t, SupportedLang } from '../../../../locales';

@Injectable()
export class GetNavbarUserUseCase {
  constructor(
       @Inject(USER_REPO)
   
  private readonly userRepository: IUserDomainRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  async execute(userId: number, language: SupportedLang = 'al'): Promise<NavbarUser> {
    const navUser = await this.userRepository.getNavbarUser(userId);

    if (!navUser) {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', language),
      });
    }

    const publicUrl = navUser ? navUser.profileImg : null;

    return new NavbarUser(
      navUser.username,
      navUser.email,
      publicUrl,
      navUser.lastLogin,
      navUser.role,
    );
  }
}