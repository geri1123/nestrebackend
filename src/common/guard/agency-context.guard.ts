import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModuleRef } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { t, SupportedLang } from '../../locales';
import { GetAgentAuthContextUseCase } from '../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { GetAgencyByOwnerUseCase } from '../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { GetAgencyByIdUseCase } from '../../modules/agency/application/use-cases/get-agency-by-id.use-case';
import { user_role, user_status, agencyagent_status, agency_status } from '@prisma/client';
import { REQUIRE_AGENCY_CONTEXT } from '../decorators/require-agency-context.decorator';
import { mapAgentPermissions } from '../helpers/permissions.helper';

@Injectable()
export class AgencyContextGuard implements CanActivate {
  private getAgentAuthContext: GetAgentAuthContextUseCase;
  private findByOwner: GetAgencyByOwnerUseCase;
  private getAgencyById: GetAgencyByIdUseCase;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    // Check user suspension FIRST (before checking decorator)
    if (req.user && req.user.status === user_status.suspended) {
      throw new ForbiddenException(t('accountSuspended', lang));
    }

    // Check if route requires agency context
    const requireAgencyContext = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_AGENCY_CONTEXT,
      [context.getHandler(), context.getClass()]
    );

    // If already loaded, just check status and return
    if (req.agencyId !== undefined) {
      this.checkAgencyAndAgentStatus(req, lang);
      return true;
    }

    const { user } = req;
    
    // Only load for agency_owner and agent roles
    if (!user || (user.role !== user_role.agent && user.role !== user_role.agency_owner)) {
      return true;
    }

    // If route doesn't require agency context, skip loading but still check if already present
    if (!requireAgencyContext) {
      return true;
    }

    // Lazy load dependencies
    if (!this.getAgentAuthContext) {
      this.getAgentAuthContext = this.moduleRef.get(GetAgentAuthContextUseCase, { strict: false });
    }
    if (!this.findByOwner) {
      this.findByOwner = this.moduleRef.get(GetAgencyByOwnerUseCase, { strict: false });
    }
    if (!this.getAgencyById) {
      this.getAgencyById = this.moduleRef.get(GetAgencyByIdUseCase, { strict: false });
    }

    if (user.role === user_role.agent) {
      const agentContext = await this.getAgentAuthContext.execute(user.id);
      if (!agentContext) {
        throw new ForbiddenException(t('userNotAssociatedWithAgency', lang));
      }

      req.agencyId = agentContext.agencyId;
      req.agencyAgentId = agentContext.agencyAgentId;
      req.agentPermissions = mapAgentPermissions(agentContext.permissions);
      req.agentStatus = agentContext.status;

      const agency = await this.getAgencyById.execute(agentContext.agencyId, lang);
      req.agencyStatus = agency.status;

      // Check status after loading
      this.checkAgencyAndAgentStatus(req, lang);
      return true;
    }

    if (user.role === user_role.agency_owner) {
      const agency = await this.findByOwner.execute(user.id, lang);
      req.agencyId = agency.id;
      req.agencyStatus = agency.status;

      // Check status after loading
      this.checkAgencyAndAgentStatus(req, lang);
      return true;
    }

    return true;
  }

  private checkAgencyAndAgentStatus(req: RequestWithUser, lang: SupportedLang): void {
    if (!req.user) return;

    // Check agent status
    if (req.user.role === user_role.agent) {
      if (req.agentStatus && req.agentStatus !== agencyagent_status.active) {
        throw new ForbiddenException(t('agentInactive', lang));
      }

      if (req.agencyStatus === agency_status.suspended) {
        throw new ForbiddenException(t('agencySuspended', lang));
      }
    }

    // Check agency owner status
    if (req.user.role === user_role.agency_owner) {
      if (req.agencyStatus === agency_status.suspended) {
        throw new ForbiddenException(t('agencySuspended', lang));
      }
    }
  }
}