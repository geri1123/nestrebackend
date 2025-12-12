import { Inject, Injectable } from "@nestjs/common";
import {USER_REPO, type IUserDomainRepository } from "../../domain/repositories/user.repository.interface";

@Injectable()
export class FindUnverifiedUsersUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly usersRepo: IUserDomainRepository,
  ) {}

  async execute(beforeDate: Date) {
    return this.usersRepo.findUnverifiedBefore(beforeDate);
  }
}