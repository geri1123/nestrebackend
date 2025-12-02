import { Inject, Injectable } from "@nestjs/common";

import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";

@Injectable()
export class DeleteRegistrationRequestsByUserUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly repo: IRegistrationRequestRepository,
  ) {}

  async execute(userId: number): Promise<void> {
    await this.repo.deleteByUserId(userId);
  }
}
