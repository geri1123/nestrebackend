import { Inject, Injectable } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class VerifyUserEmailUseCase {
  constructor(
       @Inject(USER_REPO)
   
    private readonly repo: IUserDomainRepository,
  ) {}

  async execute(userId: number, newStatus: string ,  tx?: Prisma.TransactionClient): Promise<void> {
    await this.repo.verifyEmail(userId, true, newStatus , tx);
  }
}