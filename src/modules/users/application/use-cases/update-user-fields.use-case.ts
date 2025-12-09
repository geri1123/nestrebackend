import { Inject, Injectable } from "@nestjs/common";
import { USERS_REPOSITORY_TOKENS } from "../../domain/repositories/user.repository.tokens";
import {type IUserDomainRepository, UpdateUserFields } from "../../domain/repositories/user.repository.interface";
import { SupportedLang, t } from "../../../../locales";
import { GetUserProfileUseCase } from "./get-user-profile.use-case";
import { Prisma } from "@prisma/client";

@Injectable()
export class UpdateUserFieldsUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly repo: IUserDomainRepository,
    private readonly getUser: GetUserProfileUseCase,
  ) {}

  // async execute(
  //   userId: number,
  //   fields: Partial<UpdateUserFields>,
  //   lang: SupportedLang = "al"
  // ) {
  //   const user = await this.getUser.execute(userId, lang);

   

  //   await this.repo.updateFields(userId, fields);

  //   return { success: true };
  // }
  async execute(
  userId: number,
  fields: Partial<UpdateUserFields>,
  lang: SupportedLang = "al",
  tx?: Prisma.TransactionClient,
) {
  const user = await this.getUser.execute(userId, lang);
  await this.repo.updateFields(userId, fields, tx);
  return { success: true };
}
}