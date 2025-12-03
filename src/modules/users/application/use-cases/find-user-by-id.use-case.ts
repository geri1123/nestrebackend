import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { SupportedLang, t } from '../../../../locales';

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepo: IUserDomainRepository
  ) {}

  async execute(userId: number, lang: SupportedLang) {
    const user = await this.userRepo.findById(userId);
    if (!user)
      throw new NotFoundException({ success: false, message: t('userNotFound', lang) });

    return user;
  }
}