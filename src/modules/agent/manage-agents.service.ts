import { Injectable, NotFoundException } from "@nestjs/common";
import { AgentsRepository } from "../../repositories/agent/agent.repository";
import { AgentPermissionRepository } from "../../repositories/agent-permision/agent-permision.repository";
import { SupportedLang, t } from "../../locales";
import { UpdateAgentsDto } from "./dto/update-agents.dto";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
import { AgentPermisionService } from "./agent-permision.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationTemplateService } from "../notification/notifications-template.service";
import { BaseUserInfo } from "../users/types/base-user-info";
import { NotFoundError } from "rxjs";
@Injectable()
export class ManageAgentsService{
    constructor(
        private readonly agentRepo:AgentsRepository , 
        private readonly agentPermisionService:AgentPermisionService,
        private readonly notificationService:NotificationService,
        private readonly notificationTemplateService:NotificationTemplateService,
    ){}

   async updateAgencyAgents(
    id: number,
    agencyId: number,
    dto: UpdateAgentsDto,
    language: SupportedLang,
    user:BaseUserInfo,
  ) {
    // Validate DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      throwValidationErrors(errors, language);
    }

   const updatedByName = user.username;
    const dataToUpdate: Partial<{
      role_in_agency: agencyagent_role_in_agency;
      commission_rate: number;
      end_date: Date;
      status: agencyagent_status;
    }> = {
      ...(dto.role_in_agency !== undefined && { role_in_agency: dto.role_in_agency }),
      ...(dto.commission_rate !== undefined && { commission_rate: dto.commission_rate }),
      ...(dto.end_date !== undefined && { end_date: new Date(dto.end_date) }),
      ...(dto.status !== undefined && { status: dto.status }),
    };

    const updatedAgent = await this.agentRepo.updateAgencyAgent(id, dataToUpdate);

 
 if (dto.permissions) {
    const existingPermissions = await this.agentPermisionService.getPermissions(id);

    if (existingPermissions) {
    
      await this.agentPermisionService.updatePermissions(id, dto.permissions);
    } else {
      
      await this.agentPermisionService.addPermissions(id, agencyId, dto.permissions);
    }
  }



  // send notification to agent
const changes: string[] = [];
if (dto.commission_rate !== undefined) changes.push(`commission rate to ${dto.commission_rate}`);
if (dto.role_in_agency !== undefined) changes.push(`role to ${dto.role_in_agency}`);
if (dto.status !== undefined) changes.push(`status to ${dto.status}`);
if (dto.end_date !== undefined) changes.push(`end date to ${new Date(dto.end_date).toLocaleDateString()}`);

const reason = changes.join(', ') || 'updated your information';

const agent = await this.agentRepo.findById(id); 

if (!agent) {
 throw new NotFoundException(t("userNotFound", language));
}

 const translations = this.notificationTemplateService.getAllTranslations(
  'agent_updated_by_agent',
  {
    updatedByName,
    reason
  }
);


const agentId = agent.agent_id;
await this.notificationService.sendNotification({
  userId: updatedAgent.agent_id,
  type: 'agent_updated_by_agent',
  translations,
});


  return updatedAgent;
  }
}