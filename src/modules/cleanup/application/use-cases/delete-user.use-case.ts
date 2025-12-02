import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {type IUserDomainRepository } from "../../../users/domain/repositories/user.repository.interface";

import { USERS_REPOSITORY_TOKENS } from "../../../users/domain/repositories/user.repository.tokens";
import { DeleteRegistrationRequestsByUserUseCase } from "../../../registration-request/application/use-cases/delete-requests-by-user.use-case";
import { DeleteAgencyByOwnerUseCase } from "../../../agency/application/use-cases/delete-agency-by-owner.use-case";

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly usersRepo: IUserDomainRepository,

    private readonly deleteRequests: DeleteRegistrationRequestsByUserUseCase,
    private readonly deleteAgency: DeleteAgencyByOwnerUseCase,
  ) {}

  async execute(userId: number): Promise<void> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException(`User ${userId} not found`);

    await this.deleteRequests.execute(userId);
    await this.deleteAgency.execute(userId);

    await this.usersRepo.deleteById(userId);
  }
}