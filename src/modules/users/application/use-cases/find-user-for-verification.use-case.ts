import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import {USER_REPO, type IUserDomainRepository } from "../../domain/repositories/user.repository.interface";
import { SupportedLang, t } from "../../../../locales";

@Injectable()
export class FindUserForVerificationUseCase {
  constructor(
     @Inject(USER_REPO)
 
    private readonly userRepo: IUserDomainRepository
  ) {}

  async execute(identifier: string, lang: SupportedLang) {
    const user = await this.userRepo.findByIdentifierForVerification(identifier);

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t("userNotFound", lang),
      });
    }

    return user;
  }
}