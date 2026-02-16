import { Injectable, ForbiddenException } from '@nestjs/common';
import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { GetAgencyByIdUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-id.use-case';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { t, SupportedLang } from '../../../locales';
import { AgencyAgentStatus, AgencyStatus } from '@prisma/client';
import { mapAgentPermissions } from '../../../common/helpers/permissions.helper';

@Injectable()
export class AgentContextService {
  constructor(
    private readonly getAgentAuthContext: GetAgentAuthContextUseCase,
    private readonly getAgencyById: GetAgencyByIdUseCase,
  ) {}


async getAgentProfileData(userId: number, lang: SupportedLang) {
    const agentContext = await this.getAgentAuthContext.execute(userId);
    if (!agentContext) {
      throw new ForbiddenException(t('userNotAssociatedWithAgency', lang));
    }

    const agency = await this.getAgencyById.execute(agentContext.agencyId, lang);

  return {
  agencyAgentId: agentContext.agencyAgentId,
  roleInAgency: agentContext.roleInAgency,
  status: agentContext.status,
  commissionRate: agentContext.commissionRate,
  startDate: agentContext.startDate,
  updatedAt: agentContext.updatedAt,
  permissions: mapAgentPermissions(agentContext.permissions),
  agency: {
    id: agency.id,
    name: agency.agencyName,
    email: agency.agencyEmail ?? null,
    logo: agency.logo ?? null,
    website: agency.website ?? null,
    status: agency.status,
  },
};
}
  async loadAgentContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
    const agentContext = await this.getAgentAuthContext.execute(req.user!.id);
    if (!agentContext) {
      throw new ForbiddenException(t('userNotAssociatedWithAgency', lang));
    }

    const agency = await this.getAgencyById.execute(agentContext.agencyId, lang);

    req.agencyId = agency.id;
    req.agencyStatus = agency.status;
    req.agencyAgentId = agentContext.agencyAgentId;
    req.agentPermissions = mapAgentPermissions(agentContext.permissions);
    req.agentStatus = agentContext.status;
    req.isAgencyOwner = false;
  }

  validateAgentStatus(req: RequestWithUser, lang: SupportedLang): void {
    if (!req.agentStatus) return;

    if (req.agentStatus === AgencyAgentStatus.inactive) {
      throw new ForbiddenException(t('agentInactive', lang));
    }

    if (req.agentStatus === AgencyAgentStatus.terminated) {
      throw new ForbiddenException(t('agentTerminated', lang));
    }
  }

  validateAgencyStatusForAgent(req: RequestWithUser, lang: SupportedLang): void {
    if (req.agencyStatus === AgencyStatus.suspended) {
      throw new ForbiddenException(t('agencySuspended', lang));
    }

    if (req.agencyStatus === AgencyStatus.inactive) {
      throw new ForbiddenException(t('agencyInactive', lang));
    }
  }
}