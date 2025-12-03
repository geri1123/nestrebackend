import { Inject, Injectable } from "@nestjs/common";
import { USERS_REPOSITORY_TOKENS } from "../../domain/repositories/user.repository.tokens";
import {type IUserDomainRepository } from "../../domain/repositories/user.repository.interface";

@Injectable()
export class FindUserForAuthUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepo: IUserDomainRepository,
  ) {}

  async execute(identifier: string) {
    return this.userRepo.findByIdentifierForAuth(identifier);
  }
}