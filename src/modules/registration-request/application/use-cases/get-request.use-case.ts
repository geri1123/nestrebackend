import { Inject, Injectable } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { registrationrequest_status } from "@prisma/client";

@Injectable()
export class GetRequestsUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) private readonly repo: IRegistrationRequestRepository
  ) {}

  execute(agencyId: number, page: number, take: number, status?: registrationrequest_status) {
    return this.repo.findByAgencyIdAndStatus(agencyId, status, (page - 1) * take, take);
  }
}