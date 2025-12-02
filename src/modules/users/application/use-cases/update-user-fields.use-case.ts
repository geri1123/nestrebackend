import { Inject, Injectable } from "@nestjs/common";
import { USERS_REPOSITORY_TOKENS } from "../../domain/repositories/user.repository.tokens";
import {type IUserDomainRepository, UpdateUserFields } from "../../domain/repositories/user.repository.interface";
import { SupportedLang, t } from "../../../../locales";
import { GetUserProfileUseCase } from "./get-user-profile.use-case";

@Injectable()
export class UpdateUserFieldsUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly repo: IUserDomainRepository,
    private readonly getUser: GetUserProfileUseCase,
  ) {}

  async execute(
    userId: number,
    fields: Partial<UpdateUserFields>,
    lang: SupportedLang = "al"
  ) {
    const user = await this.getUser.execute(userId, lang);

    // (Optional) enforce domain rules:
    // Example: user cannot downgrade themselves, etc.

    await this.repo.updateFields(userId, fields);

    return { success: true };
  }
}