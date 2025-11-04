import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { RegistrationRequestRepository } from "../repositories/registration-request/registration-request.repository";
import { NotificationService } from "../notification/notification.service";
import { SupportedLang, t } from "../locales";
import { RegisterAgentDto } from "../auth/dto/register-agent.dto";
import { UpdateRequestStatusType } from "./type/updatestatus-type";
import { AgencyService } from "../agency/agency.service";

import { AgentService } from "../agent/agent.service";
import { registrationrequest_status } from "@prisma/client";

@Injectable()
export class RegistrationRequestService {
  constructor(
    private readonly requestRepo: RegistrationRequestRepository,
    private readonly notificationService: NotificationService,
    private readonly agencyservice:AgencyService,
    private readonly agentservice:AgentService
  ) {}
async getRequests(
  agencyId: number,
  limit = 10,
  offset = 0,
  status?: registrationrequest_status, 
) {
  const requests = await this.requestRepo.findByAgencyIdAndStatus(
    agencyId,
    status, 
    offset,
    limit,
  );

  return requests.map(r => ({
    id: r.id,
    userId: r.user_id,
    username: r.user.username,
    email: r.user.email,
    requestType: r.request_type,
    status: r.status,
    requestedRole: r.requested_role,
    createdAt: r.created_at,
  }));
}
async getrequestscount(agencyId:number , status:any):Promise<number>{
  return this.requestRepo.countAgentRequestsByAgencyId(agencyId ,status);
}
async setUnderReview(userId: number, language: SupportedLang = "al"): Promise<void> {
  // Find the latest registration request for this user
  const requests = await this.requestRepo.findByUserId(userId);

  if (!requests || requests.length === 0) {
    throw new NotFoundException({
      success: false,
      message: t('validationFailed', language),
      errors: { email: [t('userNotFound', language)] },
    });
  }

 
 const updatedRequest = await this.requestRepo.setUnderReview(userId);

if (!updatedRequest) {
  throw new BadRequestException({
    success: false,
    message: t('couldNotUpdateRequest', language),
  });
}
}
async getRequestsByUserId(userId: number) {
    return this.requestRepo.findByUserId(userId);
  }

  async checkAgentData(
    publicCode: string,
    idCardNumber: string,
    language: SupportedLang = "al"
  ): Promise<Record<string, string[]>> {
    const errors: Record<string, string[]> = {};

  
     const agency = await this.agencyservice.checkAgencyPublicCode(publicCode);
    if (!agency) {
      errors.public_code = [t("invalidPublicCode", language)];
    }

 
    if (await this.requestRepo.idCardExists(idCardNumber)) {
      errors.id_card_number = [t("idCardExists", language)];
    }
 await this.agentservice.ensureIdCardIsUnique(idCardNumber, language);
   
    return errors;
  }

 
  async createAgentRequest(
    userId: number,
    dto: RegisterAgentDto,
    language: SupportedLang = "al"
  ): Promise<void> {
  

    
    // const agency = await this.agencyRepo.findByPublicCode(dto.public_code);
  const agency = await this.agencyservice.getAgencyByPublicCode(dto.public_code);

  if (!agency) {
    throw new BadRequestException({
      success: false,
      message: t("invalidPublicCode", language),
    });
  }

    await this.requestRepo.create({
      userId,
      idCardNumber: dto.id_card_number,
      status: "pending",
      agencyName: agency!.agency_name,
      agencyId: agency!.id,
      requestedRole: dto.requested_role,
      requestType: "agent_license_verification",
    });

   
  }

  async updateRequests(data:UpdateRequestStatusType, language:SupportedLang="al"){
    return this.requestRepo.UpdateRequestFields(data.requestId, data.action,  data.reviewedBy ,data.reviewNotes);
  }
async findRequestById(
  id: number,
  language: SupportedLang = "al"
): Promise<{
  id: number;
  user_id: number;
  agency_id: number | null;
  user: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}> {
  const request = await this.requestRepo.findRequestById(id);

  if (!request) {
    throw new NotFoundException({
      success: false,
      message: t('validationFailed', language),
    });
  }

  // Return exactly as Prisma gives it
  return request;
}

}