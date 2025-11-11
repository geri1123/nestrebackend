
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { SupportedLang, t } from '../../locales';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    if (!req.user) {
      throw new ForbiddenException(t('userNotAuthenticated', lang));
    }

    // Agency Owner full acces
    if (req.user.role === 'agency_owner') {
      return true;
    }

    // agent: check assigned permissions
    if (req.user.role === 'agent') {
      if (!req.agencyAgentId) throw new ForbiddenException(t('insufficientPermissions', lang));

      const permissions = req.agentPermissions;
      if (!permissions) throw new ForbiddenException(t('insufficientPermissions', lang));

      for (const perm of requiredPermissions) {
        if (!(permissions as any)[perm]) {
          throw new ForbiddenException(t('insufficientPermissions', lang));
        }
      }
      return true;
    }

    return true;
  }
}

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { SupportedLang, t } from '../../locales';
// import { AgencyService } from '../../modules/agency/agency.service';

// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly agencyService: AgencyService,
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
//       throw new ForbiddenException(t('userNotAuthenticated', lang));
//     }

//     const method = req.method.toUpperCase();
//     const isMutating = ['POST', 'PATCH', 'DELETE'].includes(method);

   
//     // Agency Owner
   
//     if (req.user.role === 'agency_owner') {
//       if (isMutating) {
//          const agencyFull = await this.agencyService.getAgencyInfo(
//           req.agencyId!,
//           lang,
//           true, 
//           req   
//         );
//         if (!agencyFull) throw new ForbiddenException(t('agencyNotFound', lang));
//         if (agencyFull.status === 'suspended') throw new ForbiddenException(t('agencySuspended', lang));
//       }
//       return true;
//     }

  
//     // Agent
   
//     if (req.user.role === 'agent') {
//       if (!req.agencyAgentId) throw new ForbiddenException(t('insufficientPermissions', lang));

//       const permissions = req.agentPermissions;
//       if (!permissions) throw new ForbiddenException(t('insufficientPermissions', lang));

//       for (const perm of requiredPermissions) {
//         if (!(permissions as any)[perm]) {
//           throw new ForbiddenException(t('insufficientPermissions', lang));
//         }
//       }

//       return true;
//     }

//     return true; 
//   }
// }
