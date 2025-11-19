import { ForbiddenException, Injectable } from "@nestjs/common";
import { RegistrationRequestService } from "../registration-request/registration.request.service";
import { SupportedLang, t } from "../../locales";
import { agencyagent_role_in_agency, registrationrequest_status } from "@prisma/client";
import { AgentService } from "../agent/agent.service";
import { UserService } from "../users/services/users.service";
import { EmailService } from "../../infrastructure/email/email.service";
import { AgentPermisionService } from "../agent/agent-permision.service";
import { UpdateRequestStatusDto } from "./dto/agency-request.dto";

@Injectable()

export class AgencyRequestsService {
  constructor(
    private readonly registrationrequestService:RegistrationRequestService,
      private readonly agentsSerivice:AgentService,
      private readonly agentpermisonService:AgentPermisionService,
      private readonly userservice:UserService,
      private readonly emailService:EmailService,
      
  ) {}
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


//update
async updateRequestStatus(
  requestId: number,
  agencyId: number,
  
  approvedBy: number,
  dto:UpdateRequestStatusDto,
  language: SupportedLang = "al"
) {
  const request = await this.registrationrequestService.findRequestById(requestId, language);


if (request.agency_id !== agencyId) {
  throw new ForbiddenException({
    success: false,
    message: t('cannotApproveOtherAgency', language),
    errors: { general: [t('cannotApproveOtherAgency', language)] }
  });
}

  // If approved, create the agent first
  if (dto.action === 'approved') {
    if (!dto.roleInAgency) {
      throw new Error('roleInAgency is required when approving');
    }
    


    
  await this.agentsSerivice.findExistingAgent(request.user_id, language);
  
     const agent = await this.agentsSerivice.createAgencyAgent({
    agencyId,
    agentId: request.user_id,
    addedBy: approvedBy,
    idCardNumber:request.id_card_number ||"",
    roleInAgency:dto.roleInAgency,
    commissionRate:dto.commissionRate,
    status: "active",
  }, language);

  await this.userservice.updateFields(request.user_id, {
    status: "active",
    
  });
    
 await this.agentpermisonService.addPermissions(
  agent.id,
  agencyId,
  dto.permissions && Object.keys(dto.permissions).length > 0 ? dto.permissions : {}
);
  

await this.emailService.sendAgentWelcomeEmail(
  request.user.email,
  `${request.user.first_name || ''} ${request.user.last_name || ''}`.trim()
);
  } else if(dto.action==="rejected"){
     await this.userservice.updateFields(request.user_id, {
    status: "active",
    role: "user"
  });
    await this.emailService.sendAgentRejectedEmail(
    request.user.email,
    `${request.user.first_name || ''} ${request.user.last_name || ''}`.trim()
  );
  }

   this.registrationrequestService.updateRequests(
    {
      requestId,
      action:dto.action,
      commissionRate:dto.commissionRate,
      reviewNotes:dto.reviewNotes,
      reviewedBy: approvedBy,
    },
    language
  );
   const message =
    dto.action === 'approved'
      ? t('registrationApprovedSuccessfully', language)
      : t('registrationRejectedSuccessfully', language);

  return {
    success: true,
    message,
  };
}
}

