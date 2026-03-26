
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { t } from '../../../locales';
import { GetAgentByIdUseCase } from '../../../modules/agent/application/use-cases/get-agent-by-id.use-case';


@Injectable()
export class AgentBelongsToAgencyGuard implements CanActivate {
  constructor(private readonly getAgentById: GetAgentByIdUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const agentId = parseInt(req.params.id);
    const userAgencyId = req.agencyId;
    const language = req.language;

    // Validate that the target agent belongs to the same agency
    const agent = await this.getAgentById.execute(agentId, language);

    if (!agent || agent.agencyId !== userAgencyId) {
      throw new ForbiddenException(t('cannotEditOtherAgencyAgent', language));
    }

    return true;
  }
}