import { Injectable, Inject } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class UpdateLastLoginUseCase {
  constructor(
       @Inject(USER_REPO)
   
    private readonly userRepo: IUserDomainRepository
  ) {}

  async execute(userId: number) {
    await this.userRepo.updateFields(userId, { last_login: new Date() });
  }
}