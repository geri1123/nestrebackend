
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { t } from '../../locales';
import { GetAgentByIdUseCase } from '../../modules/agent/application/use-cases/get-agent-by-id.use-case';

@Injectable()
export class AgentBelongsToAgencyGuard implements CanActivate {
  private getAgentById: GetAgentByIdUseCase;

  constructor(private readonly moduleRef: ModuleRef) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Lazy load dependency
    if (!this.getAgentById) {
      this.getAgentById = this.moduleRef.get(GetAgentByIdUseCase, { strict: false });
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const agentId = parseInt(req.params.id);
    const userAgencyId = req.agencyId;
    const language = req.language;

    const agent = await this.getAgentById.execute(agentId, language);

    if (!agent || agent.agencyId !== userAgencyId) {
      throw new ForbiddenException(t('cannotEditOtherAgencyAgent', language));
    }

    return true;
  }
}