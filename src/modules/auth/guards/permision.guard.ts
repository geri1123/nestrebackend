import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { AgentPermisionService } from '../../agent/agent-permision.service';
import { AgentService } from '../../agent/agent.service';
import { SupportedLang, t } from '../../../locales';
import { AgencyService } from '../../agency/agency.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly agentPermissionService: AgentPermisionService,
    private readonly agentService: AgentService,
    private readonly agencyservice:AgencyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permissions required → allow access
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    if (!req.user) {
      throw new ForbiddenException({ success: false, message: t('userNotAuthenticated', lang) });
    }

    const method = req.method.toUpperCase();
    const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);

    // =========================
    // Handle Agency Owner
    // =========================
   if (req.user.role === 'agency_owner') {
  if (isMutating) {
   
    if (!req.agencyId) {
      throw new ForbiddenException({ success: false, message: t('userNotAuthenticated', lang) });
    }

    const agencyFull = await this.agencyservice.getAgencyInfoByOwner(req.agencyId, lang);

    if (!agencyFull) {
      throw new ForbiddenException({ success: false, message: t('agencyNotFound', lang) });
    }

    if (agencyFull.status === 'suspended') {
      throw new ForbiddenException({ success: false, message: t('agencySuspended', lang) });
    }
  }

  return true; // owner allowed
}

    // =========================
    // Handle Agents
    // =========================
    const agencyAgentId = req.agencyAgentId;
    if (!agencyAgentId) throw new ForbiddenException(t('insufficientPermissions', lang));

    const agent = await this.agentService.getAgentWithPermissions(agencyAgentId);
    if (!agent) throw new ForbiddenException(t('userNotFound', lang));

    if (isMutating) {
      if (agent.status !== 'active') throw new ForbiddenException(t('agentInactive', lang));
      if (agent.agency?.status !== 'active') throw new ForbiddenException(t('agencyInactive', lang));
    }

    const permissions = agent.permission;
    if (!permissions) throw new ForbiddenException(t('insufficientPermissions', lang));

    for (const perm of requiredPermissions) {
      if (!(permissions as any)[perm]) {
        throw new ForbiddenException(t('insufficientPermissions', lang));
      }
    }

    return true;
  }
}
