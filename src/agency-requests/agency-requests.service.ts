import { Injectable } from "@nestjs/common";
import { RegistrationRequestService } from "../registration-request/registration.request.service";
import { SupportedLang } from "../locales";
import { registrationrequest_status } from "@prisma/client";

@Injectable()

export class AgencyRequestsService {
  constructor(private readonly registrationrequestService:RegistrationRequestService) {}
async getRequestsForAgencyOwner(
  agencyId: number,
  page = 1,           
  limit = 10,
  status?: registrationrequest_status
) {
  const skip = (page - 1) * limit;

  const [total, requests] = await Promise.all([
    this.registrationrequestService.getrequestscount(agencyId, status),
    this.registrationrequestService.getRequests(agencyId, limit, skip, status)
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    requests,
  };
}
async updateRequestStatus(requestId:number, agencyId:number, approvedBy:number, action:'approve' | 'reject', roleInAgency?:string, commissionRate?:number, reviewNotes?:string){


}
}