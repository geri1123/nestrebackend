import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../common/types/request-with-user.interface';
import { AgentPermisionService } from '../../agent/agent-permision.service';
import { AgentService } from '../agent.service';
import { SupportedLang, t } from '../../locales';
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
//    if (req.user.role === 'agency_owner') {
//   const method = req.method.toUpperCase();
//   const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);

// //   if (isMutating) {
// //     // Fetch the agency using AgencyRepository
// //     const agency = await this.agencyservice.getAgencyByOwnerOrFail(req.userId? , lang);
// //     if (!agency) {
// //       throw new ForbiddenException(t('userNotAuthenticated', lang));
// //     }

// //     const agencyFull = await this.agencyservice.getAgencyInfoByOwner(agency.id);

// //     // Check if agency is suspended
// //     if (agencyFull?.status === 'suspended') {
// //       throw new ForbiddenException(t('agencySuspended', lang));
// //     }
// //   }

//   return true; // owner can continue if not suspended
// }

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

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../../common/types/request-with-user.interface';
// import { AgentPermisionService } from '../../agent/agent-permision.service';
// import { AgentService } from '../agent.service';
// import { SupportedLang, t } from '../../locales';

// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly agentPermissionService: AgentPermisionService,
//     private readonly agentService: AgentService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
//       context.getHandler(),
//       context.getClass(),
//     ]);

//     if (!requiredPermissions || requiredPermissions.length === 0) return true;

//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al';

//     if (!req.user) {
//       throw new ForbiddenException({
//         success: false,
//         message: t('userNotAuthenticated', lang),
//       });
//     }

//     // Agency owners bypass agent permissions
//     if (req.user.role === 'agency_owner') return true;

//     const agencyAgentId = req.agencyAgentId;
//     if (!agencyAgentId) {
//       throw new ForbiddenException(t('insufficientPermissions', lang));
//     }

//     // Fetch agent + permissions
//     const agent = await this.agentService.getAgentWithPermissions(agencyAgentId);
//     if (!agent) {
//       throw new ForbiddenException(t('userNotFound', lang));
//     }

//     // Only enforce status checks for mutating actions (POST, PATCH, DELETE)
//     const method = req.method.toUpperCase();
//     const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);
//     if (isMutating) {
//       if (agent.status !== 'active') {
//         throw new ForbiddenException(t('agentInactive', lang));
//       }
//       if (agent.agency?.status !== 'active') {
//         throw new ForbiddenException(t('agencyInactive', lang));
//       }
//     }

//     const permissions = agent.permission;
//     if (!permissions) {
//       throw new ForbiddenException(t('insufficientPermissions', lang));
//     }

//     // Check required permissions
//     for (const perm of requiredPermissions) {
//       if (!(permissions as any)[perm]) {
//         throw new ForbiddenException(t('insufficientPermissions', lang));
//       }
//     }

//     return true;
//   }
// }

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../../common/types/request-with-user.interface';
// import { AgentPermisionService } from '../../agent/agent-permision.service';
// import { SupportedLang, t } from '../../locales';
// import { AgentService } from '../agent.service';

// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly agentPermissionService: AgentPermisionService,
//     private readonly agentserice:AgentService,
//   ) {}
// async canActivate(context: ExecutionContext): Promise<boolean> {
//   const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
//     context.getHandler(),
//     context.getClass(),
//   ]);

//   if (!requiredPermissions || requiredPermissions.length === 0) return true;

//   const req = context.switchToHttp().getRequest<RequestWithUser>();
//   const lang: SupportedLang = req.language || 'al';

//   if (!req.user) {
//     throw new ForbiddenException({
//       success: false,
//       message: t('userNotAuthenticated', lang),
//     });
//   }

  
//   if (req.user.role === 'agency_owner') return true;

//   const agencyAgentId = req.agencyAgentId;
//   if (!agencyAgentId) {
//     throw new ForbiddenException(
      
//        t('insufficientPermissions', lang)
//     );
//   }

//   // ✅ Fetch agent + permissions in one go
//   const agent = await this.agentserice.getAgentWithPermissions(agencyAgentId);

//   if (!agent) {
//     throw new ForbiddenException(
      
//       t('userNotFound', lang),
//     );
//   }

 
//   if (agent.status !== 'active') {
//     throw new ForbiddenException(
    
//        t('agentInactive', lang),
//     );
//   }
// if (agent.agency?.status !== 'active') {
//   throw new ForbiddenException({
//     success: false,
//     message: t('agencyInactive', lang), 
//   });
// }
//   const permissions = agent.permission;
//   if (!permissions) {
//     throw new ForbiddenException(
    
//        t('insufficientPermissions', lang),
//     );
//   }

 
//   for (const perm of requiredPermissions) {
//     if (!(permissions as any)[perm]) {
//       throw new ForbiddenException(
      
//       t('insufficientPermissions', lang),
//       );
//     }
//   }

//   return true;
// }

// }
