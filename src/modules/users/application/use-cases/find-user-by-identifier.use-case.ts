import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class FindUserByIdentifierUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepo: IUserDomainRepository
  ) {}

  async execute(identifier: string) {
    const user = await this.userRepo.findByIdentifier(identifier);
    return user;
  }
}