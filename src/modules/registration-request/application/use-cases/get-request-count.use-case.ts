import { Inject, Injectable } from "@nestjs/common";
import { registrationrequest_status } from "@prisma/client";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";

@Injectable()
export class GetRequestCountUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly repo: IRegistrationRequestRepository,
  ) {}

  async execute(
    agencyId: number,
    status?: registrationrequest_status
  ): Promise<number> {
    return this.repo.countRequests(agencyId, status);
  }
}
