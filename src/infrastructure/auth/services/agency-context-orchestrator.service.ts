import { Injectable } from '@nestjs/common';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang } from '../../../locales';
import { UserRole } from '@prisma/client';
import { AgentContextService } from './agent-context.service';
import { AgencyOwnerContextService } from './agency-owner-context.service';

@Injectable()
export class AgencyContextOrchestrator {
  constructor(
    private readonly agentContextService: AgentContextService,
    private readonly agencyOwnerContextService: AgencyOwnerContextService,
  ) {}

  async loadContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
    const { user } = req;
    if (!user) return;

    if (user.role === UserRole.agent) {
      await this.agentContextService.loadAgentContext(req, lang);
    } else if (user.role === UserRole.agency_owner) {
      await this.agencyOwnerContextService.loadAgencyOwnerContext(req, lang);
    }
  }

  validateStatus(req: RequestWithUser, lang: SupportedLang): void {
    if (!req.user) return;

    if (req.user.role === UserRole.agent) {
      this.agentContextService.validateAgentStatus(req, lang);
      this.agentContextService.validateAgencyStatusForAgent(req, lang);
    }

    if (req.user.role === UserRole.agency_owner) {
      this.agencyOwnerContextService.validateAgencyStatus(req, lang);
    }
  }
}