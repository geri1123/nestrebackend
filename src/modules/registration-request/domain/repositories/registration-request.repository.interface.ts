import { Prisma, RegistrationRequestStatus } from "@prisma/client";
import { RegistrationRequestEntity } from "../entities/registration-request.entity";



export interface IRegistrationRequestRepository {
  create(request: RegistrationRequestEntity , tx?:Prisma.TransactionClient): Promise<number>;

  findByUserId(userId: number): Promise<RegistrationRequestEntity[]>;

  findById(id: number): Promise<RegistrationRequestEntity | null>;

  findByAgencyIdAndStatus(
    agencyId: number,
    status?: RegistrationRequestStatus,
    skip?: number,
    take?: number
  ): Promise<RegistrationRequestEntity[]>;

  // setLatestUnderReview(userId: number , tx?:Prisma.TransactionClient): Promise<RegistrationRequestEntity | null>;
  setLatestUnderReview(
    userId: number,
    tx?: Prisma.TransactionClient
  ): Promise<boolean>;
  // idCardExists(idCard: string): Promise<boolean>;

  updateStatus(
    id: number,
    status: RegistrationRequestStatus,
    reviewedBy?: number,
    reviewNotes?: string,
     tx?: Prisma.TransactionClient
  ): Promise<RegistrationRequestEntity>;

  countRequests(agencyId: number, status?: RegistrationRequestStatus): Promise<number>;
   deleteByUserId(userId: number): Promise<number>;
}