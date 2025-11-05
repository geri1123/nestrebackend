import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../locales';
import { agencyagent_role_in_agency } from '@prisma/client';
import { AgentsRepository } from '../../repositories/agent/agent.repository';

@Injectable()
export class AgencyAgentRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly agencyAgentRepo: AgentsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<agencyagent_role_in_agency[]>(
      'agencyAgentRoles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    if (!req.userId || !req.agencyId) {
    
        throw new ForbiddenException(
            {
                success:false,
                message:t("userNotAuthenticated" , lang),
                errors:{
                    general:t("userNotAuthenticated", lang)
                }
            }
        
    
    );
    }

    
    if (req.user?.role === 'agency_owner') {
      return true;
    }

    const agent = await this.agencyAgentRepo.findByAgencyAndAgent(req.agencyId, req.userId);

    if (!agent || !requiredRoles.includes(agent.role_in_agency)) {
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    return true;
  }
}


// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../../common/types/request-with-user.interface';
// import { SupportedLang, t } from '../../locales';

// import { agencyagent_role_in_agency } from '@prisma/client';
// import { AgentsRepository } from '../../repositories/agent/agent.repository';

// @Injectable()
// export class AgencyAgentRolesGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly agencyAgentRepo: AgentsRepository, 
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredRoles = this.reflector.getAllAndOverride<agencyagent_role_in_agency[]>(
//       'agencyAgentRoles',
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredRoles || requiredRoles.length === 0) return true;

//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al';

//     if (!req.userId || !req.agencyId) {
//       throw new ForbiddenException(t('userNotAuthenticated', lang));
//     }

//     const agent = await this.agencyAgentRepo.findByAgencyAndAgent(req.agencyId, req.userId);

//     if (!agent || !requiredRoles.includes(agent.role_in_agency)) {
//       throw new ForbiddenException(t('insufficientPermissions', lang));
//     }

//     return true;
//   }
// }


