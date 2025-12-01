import { RegistrationRequestEntity } from "../entities/registration-request.entity";
import { registrationrequest_status } from "@prisma/client";

export interface IRegistrationRequestDomainRepository {
  getRequests(
    agencyId: number,
    limit: number,
    offset: number,
    status?: registrationrequest_status
  ): Promise<RegistrationRequestEntity[]>;

  countRequests(
    agencyId: number,
    status?: registrationrequest_status
  ): Promise<number>;

  findById(id: number): Promise<RegistrationRequestEntity | null>;

  create(data: {
    userId: number;
    idCardNumber: string | null;
    status: string;
    agencyId: number;
    agencyName: string;
    requestedRole: string;
    requestType: string;
  }): Promise<number>;

  updateStatus(
    id: number,
    status: registrationrequest_status,
    reviewedBy?: number,
    reviewNotes?: string
  ): Promise<void>;

  findByUserId(userId: number): Promise<RegistrationRequestEntity[]>;

  idCardExists(idCard: string): Promise<boolean>;

  deleteByUserId(userId: number): Promise<number>;
}