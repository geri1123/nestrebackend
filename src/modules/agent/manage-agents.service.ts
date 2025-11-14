import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "../../repositories/agent/agent.repository";
import { AgentPermissionRepository } from "../../repositories/agent-permision/agent-permision.repository";
import { SupportedLang } from "../../locales";
import { UpdateAgentsDto } from "./dto/update-agents.dto";
import { validate } from "class-validator";
import { throwValidationErrors } from "../../common/helpers/validation.helper";
import { agencyagent_role_in_agency, agencyagent_status } from "@prisma/client";
@Injectable()
export class ManageAgentsService{
    constructor(
        private readonly agentRepo:AgentsRepository , 
        private readonly agentPermisionRepo:AgentPermissionRepository
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

    // Map DTO to Prisma update data
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

    // Update agent
    return this.agentRepo.updateAgencyAgent(agentId, dataToUpdate);
  }
}