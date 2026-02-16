import { Inject, Injectable } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { RegistrationRequestStatus } from "@prisma/client";
import { RegistrationRequestResponseDto } from "../../dto/registration-request-response.dto";
@Injectable()
export class GetRequestsUseCase {
  constructor(
    @Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY)
    private readonly repo: IRegistrationRequestRepository
  ) {}

  async execute(
    agencyId: number,
    page: number,
    take: number,
    status?: RegistrationRequestStatus
  ) {
    // fetch entities from repo
    const entities = await this.repo.findByAgencyIdAndStatus(
      agencyId,
      status,
      (page - 1) * take,
      take
    );

    // map entities to DTOs for frontend
    return entities.map(e => new RegistrationRequestResponseDto(e));
  }
}