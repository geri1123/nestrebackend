import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../common/types/request-with-user.interface';
import { AgentPermisionService } from '../../agent/agent-permision.service';
import { SupportedLang, t } from '../../locales';
import { AgentService } from '../agent.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly agentPermissionService: AgentPermisionService,
    private readonly agentserice:AgentService,
  ) {}
async canActivate(context: ExecutionContext): Promise<boolean> {
  const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  const req = context.switchToHttp().getRequest<RequestWithUser>();
  const lang: SupportedLang = req.language || 'al';

  if (!req.user) {
    throw new ForbiddenException({
      success: false,
      message: t('userNotAuthenticated', lang),
    });
  }

  
  if (req.user.role === 'agency_owner') return true;

  const agencyAgentId = req.agencyAgentId;
  if (!agencyAgentId) {
    throw new ForbiddenException(
      
       t('insufficientPermissions', lang)
    );
  }

  // ✅ Fetch agent + permissions in one go
  const agent = await this.agentserice.getAgentWithPermissions(agencyAgentId);

  if (!agent) {
    throw new ForbiddenException(
      
      t('userNotFound', lang),
    );
  }

 
  if (agent.status !== 'active') {
    throw new ForbiddenException(
    
       t('agentInactive', lang),
    );
  }

  const permissions = agent.permission;
  if (!permissions) {
    throw new ForbiddenException(
    
       t('insufficientPermissions', lang),
    );
  }

 
  for (const perm of requiredPermissions) {
    if (!(permissions as any)[perm]) {
      throw new ForbiddenException(
      
      t('insufficientPermissions', lang),
      );
    }
  }

  return true;
}
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (!requiredPermissions || requiredPermissions.length === 0) return true;

//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al';

//     if (!req.user) {
//       throw new ForbiddenException(t('userNotAuthenticated', lang));
//     }

//     // Agency owners bypass permission checks
//     if (req.user.role === 'agency_owner') return true;

//     // Fetch permissions from DB
//     const agencyAgentId = req.agencyAgentId; 
//     if (!agencyAgentId) {
//       throw new ForbiddenException(t('insufficientPermissions', lang));
//     }

//     const permissions = await this.agentPermissionService.getPermissions(agencyAgentId);
  

//     if (!permissions) {
//       throw new ForbiddenException(t('insufficientPermissions', lang));
//     }

//     // Check if user has all required permissions
//     for (const perm of requiredPermissions) {
//       if (!(permissions as any)[perm]) {
//         throw new ForbiddenException(t('insufficientPermissions', lang));
//       }
//     }

//     return true;
//   }
}
