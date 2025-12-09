
import { RegistrationRequestRequestType } from "../types/registrationrequest-request.type";
import { registrationrequest_status } from "../types/registration-request-status.type";
import { registrationrequest_requested_role } from "@prisma/client";
import { RegistrationRequestRequestRole } from "../types/registrationrequest-requested-role.type";
import { RequestUserVO } from "../value-objects/request-user.vo";
export class RegistrationRequestEntity {
  constructor(
    public readonly id: number | null,
    public readonly userId: number,
    public readonly agencyId: number | null,
    // public readonly agencyName: string | null,
    public readonly idCardNumber: string | null,
    public readonly requestType: RegistrationRequestRequestType,
    public status: registrationrequest_status,
    public readonly requestedRole: RegistrationRequestRequestRole,
    public readonly createdAt?: Date,
    public reviewedBy?: number | null,
    public reviewedNotes?: string | null,
    public reviewedAt?: Date | null,
     public readonly user?: RequestUserVO, 
  ) {}

  setStatus(status: registrationrequest_status) {
    this.status = status;
  }

  isReviewable(): boolean {
    return this.status !== "approved" && this.status !== "rejected";
  }

  static createNew(data: {
    userId: number;
    agencyId: number | null;
    // agencyName: string | null;
    idCardNumber: string | null;
    requestType: RegistrationRequestRequestType;
    requestedRole: RegistrationRequestRequestRole;
  }): RegistrationRequestEntity {
    return new RegistrationRequestEntity(
      null,
      data.userId,
      data.agencyId,
      // data.agencyName,
      data.idCardNumber,
      data.requestType,
      "pending",
      data.requestedRole
    );
  }
}