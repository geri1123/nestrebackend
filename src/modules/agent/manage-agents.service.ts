import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "../../repositories/agent/agent.repository";
import { AgentPermissionRepository } from "../../repositories/agent-permision/agent-permision.repository";
import { SupportedLang } from "../../locales";
import { UpdateAgentsDto } from "./dto/update-agents.dto";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
import { AgentPermisionService } from "./agent-permision.service";
@Injectable()
export class ManageAgentsService{
    constructor(
        private readonly agentRepo:AgentsRepository , 
        private readonly agentPermisionService:AgentPermisionService
    ){}

   async updateAgencyAgents(
    agentId: number,
    agencyId: number,
    dto: UpdateAgentsDto,
    language: SupportedLang
  ) {
    // Validate DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      throwValidationErrors(errors, language);
    }

   
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

    const updatedAgent = await this.agentRepo.updateAgencyAgent(agentId, dataToUpdate);

 
 if (dto.permissions) {
    const existingPermissions = await this.agentPermisionService.getPermissions(agentId);

    if (existingPermissions) {
    
      await this.agentPermisionService.updatePermissions(agentId, dto.permissions);
    } else {
      
      await this.agentPermisionService.addPermissions(agentId, agencyId, dto.permissions);
    }
  }

  return updatedAgent;
  }
}