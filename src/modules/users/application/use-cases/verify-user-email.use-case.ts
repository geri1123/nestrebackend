import { Inject, Injectable } from '@nestjs/common';
import { USERS_REPOSITORY_TOKENS } from '../../domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class VerifyUserEmailUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly repo: IUserDomainRepository,
  ) {}

  async execute(userId: number, newStatus: string ,  tx?: Prisma.TransactionClient): Promise<void> {
    await this.repo.verifyEmail(userId, true, newStatus , tx);
  }
}