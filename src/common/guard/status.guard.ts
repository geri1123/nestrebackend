import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RequestWithUser } from '../types/request-with-user.interface';


import { t, SupportedLang } from '../../locales';
import { GetAgencyByIdUseCase } from '../../modules/agency/application/use-cases/get-agency-by-id.use-case';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(
    private readonly getAgencyById: GetAgencyByIdUseCase,
    
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    if (!req.user) return true; 

    const { role, status } = req.user;

   
    if (status === 'suspended') {
      throw new ForbiddenException(t('accountSuspended', lang));
    }

    
  if (role === 'agent' && req.agencyId) {
  // use existing data, no DB call
  if (req.agentStatus !== 'active') {
    throw new ForbiddenException(t('agentInactive', lang));
  }

  const agency = await this.getAgencyById.execute(req.agencyId, lang );
  if (!agency || agency.status === 'suspended') {
    throw new ForbiddenException(t('agencySuspended', lang));
  }
}
    //  Agency owner-specific
    if (role === 'agency_owner' && req.agencyId) {
      const agency = await this.getAgencyById.execute(req.agencyId, lang );
      if (!agency || agency.status === 'suspended') {
        throw new ForbiddenException(t('agencySuspended', lang));
      }
    }

    return true;
  }
}