import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AgentsRepository } from "../../repositories/agent/agent.repository";
import { RequestWithUser } from "../types/request-with-user.interface";
import { t } from "../../locales";
import { AgentService } from "../../modules/agent/agent.service";

@Injectable()
export class AgentBelongsToAgencyGuard implements CanActivate {
  constructor(private readonly agentService:AgentService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const agentId = parseInt(req.params.id);
    const userAgencyId = req.agencyId;
    const language=req.language;
    const agent = await this.agentService.findById(agentId);

    if (!agent || agent.agency_id !== userAgencyId) {
      throw new ForbiddenException(t("cannotEditOtherAgencyAgent", language));
    }

    return true;
  }
}
