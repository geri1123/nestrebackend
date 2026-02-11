import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { NavbarUser } from '../../domain/value-objects/navbar-user.vo';
import { t, SupportedLang } from '../../../../locales';

@Injectable()
export class GetNavbarUserUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
  ) {}

  async execute(userId: number, language: SupportedLang = 'al'): Promise<NavbarUser> {
    const navUser = await this.userRepository.getNavbarUser(userId);

    if (!navUser) {
      throw new NotFoundException({
        success: false,
        message: t('userNotFound', language),
      });
    }

    return new NavbarUser(
      navUser.username,
      navUser.email,
      navUser.profileImg,
      navUser.lastLogin,  
      navUser.createdAt,  
      navUser.role,
    );
  }
}