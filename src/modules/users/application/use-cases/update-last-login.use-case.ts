import { Injectable, Inject } from '@nestjs/common';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateLastLoginUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepo: IUserDomainRepository
  ) {}

  async execute(userId: number) {
    await this.userRepo.updateFields(userId, { last_login: new Date() });
  }
}