import { Inject, Injectable } from "@nestjs/common";
import {USER_REPO, type IUserDomainRepository } from "../../domain/repositories/user.repository.interface";

@Injectable()
export class FindUserForAuthUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: IUserDomainRepository,
  ) {}

  async execute(identifier: string) {
    return this.userRepo.findByIdentifierForAuth(identifier);
  }
}