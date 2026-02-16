import { Inject, Injectable } from "@nestjs/common";
import { REG_REQ_TOKEN } from "../../domain/repositories/reg-req.repository.token";
import {type IRegistrationRequestRepository } from "../../domain/repositories/registration-request.repository.interface";
import { RegistrationRequestStatus } from "@prisma/client";
export interface UpdateRequestStatusInput {
  requestId: number;
  status: RegistrationRequestStatus;
  reviewedBy?: number;
  reviewNotes?: string;
}
@Injectable()
export class UpdateRequestStatusUseCase {
  constructor(@Inject(REG_REQ_TOKEN.REG_REQ_REPOSITORY) private readonly repo: IRegistrationRequestRepository) {}

   execute(input: UpdateRequestStatusInput) {
    return this.repo.updateStatus(
      input.requestId,
      input.status,
      input.reviewedBy,
      input.reviewNotes,
    );
  }
}