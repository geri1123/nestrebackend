import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user.interface';
import { AgencyService } from '../../modules/agency/agency.service';
import { AgentService } from '../../modules/agent/agent.service';
import { t, SupportedLang } from '../../locales';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(
    private readonly agencyService: AgencyService,
    
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    if (!req.user) return true; 

    const { role, status } = req.user;

   
    if (status === 'suspended') {
      throw new ForbiddenException(t('accountSuspended', lang));
    }

    //  Agent-specific
  if (role === 'agent' && req.agencyId) {
  // use existing data, no DB call
  if (req.agentStatus !== 'active') {
    throw new ForbiddenException(t('agentInactive', lang));
  }

  const agency = await this.agencyService.getAgencyForGuard(req.agencyId, lang );
  if (!agency || agency.status === 'suspended') {
    throw new ForbiddenException(t('agencySuspended', lang));
  }
}
    //  Agency owner-specific
    if (role === 'agency_owner' && req.agencyId) {
      const agency = await this.agencyService.getAgencyForGuard(req.agencyId, lang );
      if (!agency || agency.status === 'suspended') {
        throw new ForbiddenException(t('agencySuspended', lang));
      }
    }

    return true;
  }
}