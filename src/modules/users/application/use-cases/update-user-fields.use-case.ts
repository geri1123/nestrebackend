import { Inject, Injectable } from "@nestjs/common";
import {
  type IUserDomainRepository,
  UpdateUserFields,
  USER_REPO
} from "../../domain/repositories/user.repository.interface";
import { SupportedLang } from "../../../../locales";
import { FindUserByIdUseCase } from "./find-user-by-id.use-case";
import { Prisma } from "@prisma/client";

@Injectable()
export class UpdateUserFieldsUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly repo: IUserDomainRepository,
    private readonly findUserById: FindUserByIdUseCase, 
  ) {}

  async execute(
    userId: number,
    fields: Partial<UpdateUserFields>,
    lang: SupportedLang = "al",
    tx?: Prisma.TransactionClient,
  ) {
    
    const user = await this.findUserById.execute(userId, lang);

    
    await this.repo.updateFields(userId, fields, tx);

    return { success: true };
  }
}