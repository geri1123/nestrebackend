import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class FindUserByIdentifierUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository
  ) {}

  async execute(identifier: string) {
    const user = await this.userRepo.findByIdentifier(identifier);
    return user;
  }
}