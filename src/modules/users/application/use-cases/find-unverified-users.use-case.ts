import { Inject, Injectable } from "@nestjs/common";
import { USERS_REPOSITORY_TOKENS } from "../../domain/repositories/user.repository.tokens";
import {type IUserDomainRepository } from "../../domain/repositories/user.repository.interface";

@Injectable()
export class FindUnverifiedUsersUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly usersRepo: IUserDomainRepository,
  ) {}

  async execute(beforeDate: Date) {
    return this.usersRepo.findUnverifiedBefore(beforeDate);
  }
}