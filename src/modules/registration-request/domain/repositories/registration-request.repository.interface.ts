import { Prisma, registrationrequest_status } from "@prisma/client";
import { RegistrationRequestEntity } from "../entities/registration-request.entity";

export const REG_REQ_REPO = "REG_REQ_REPO";

export interface IRegistrationRequestRepository {
  create(request: RegistrationRequestEntity , tx?:Prisma.TransactionClient): Promise<number>;

  findByUserId(userId: number): Promise<RegistrationRequestEntity[]>;

  findById(id: number): Promise<RegistrationRequestEntity | null>;

  findByAgencyIdAndStatus(
    agencyId: number,
    status?: registrationrequest_status,
    skip?: number,
    take?: number
  ): Promise<RegistrationRequestEntity[]>;

  setLatestUnderReview(userId: number , tx?:Prisma.TransactionClient): Promise<RegistrationRequestEntity | null>;

  // idCardExists(idCard: string): Promise<boolean>;

  updateStatus(
    id: number,
    status: registrationrequest_status,
    reviewedBy?: number,
    reviewNotes?: string,
     tx?: Prisma.TransactionClient
  ): Promise<RegistrationRequestEntity>;

  countRequests(agencyId: number, status?: registrationrequest_status): Promise<number>;
   deleteByUserId(userId: number): Promise<number>;
}