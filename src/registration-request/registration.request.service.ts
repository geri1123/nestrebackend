import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { RegistrationRequestRepository } from "../repositories/registration-request/registration-request.repository";
import { NotificationService } from "../notification/notification.service";
import { SupportedLang, t } from "../locales";
import { RegisterAgentDto } from "../auth/dto/register-agent.dto";

import { AgencyService } from "../agency/agency.service";

import { AgentService } from "../agent/agent.service";

@Injectable()
export class RegistrationRequestService {
  constructor(
    private readonly requestRepo: RegistrationRequestRepository,
    private readonly notificationService: NotificationService,
    private readonly agencyservice:AgencyService,
    private readonly agentservice:AgentService
  ) {}
async getunderreviewRequests(
  agencyId: number,
  limit = 10,
  offset = 0,
) {
  const requests = await this.requestRepo.findByAgencyIdUnderReview(
    agencyId,
    offset,
    limit,
  );

  
  return requests.map(r => ({
    id: r.id,
    userId: r.user_id,
    status: r.status,
    requestedRole: r.requested_role,
    createdAt: r.created_at,
  }));
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

  async changeRequststatus(){

  }
}