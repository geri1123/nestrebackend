
// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { SupportedLang, t } from '../../locales';
// import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
// import { user_role } from '@prisma/client';

// @Injectable()
// export class PermissionsGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
//       PERMISSIONS_KEY,
//       [context.getHandler(), context.getClass()]
//     );

//     if (!requiredPermissions || requiredPermissions.length === 0) {
//       return true;
//     }

//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al';

//     if (!req.user) {
//       throw new ForbiddenException(t('userNotAuthenticated', lang));
//     }

//     // Agency owners have all permissions
//     if (req.user.role === user_role.agency_owner) {
//       return true;
//     }

//     // Agents need specific permissions
//     if (req.user.role === user_role.agent) {
//       if (!req.agencyAgentId || !req.agentPermissions) {
//         throw new ForbiddenException(t('insufficientPermissions', lang));
//       }

//       for (const perm of requiredPermissions) {
//         if ((req.agentPermissions as any)[perm] !== true) {
//           throw new ForbiddenException(t('insufficientPermissions', lang));
//         }
//       }

//       return true;
//     }

//     return true;
//   }
// }

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { SupportedLang, t } from '../../locales';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { user_role } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    // Check if ProductOwnershipGuard set a flag to skip permission check
    if ((req as any).skipPermissionCheck === true) {
      return true;
    }

    if (!req.user) {
      throw new ForbiddenException(t('userNotAuthenticated', lang));
    }

    // Agency owners have all permissions
    if (req.user.role === user_role.agency_owner) {
      return true;
    }

    // Agents need specific permissions
    if (req.user.role === user_role.agent) {
      if (!req.agencyAgentId || !req.agentPermissions) {
        throw new ForbiddenException(t('insufficientPermissions', lang));
      }

      // Check that agent has ALL required permissions
      for (const perm of requiredPermissions) {
        if ((req.agentPermissions)[perm] !== true) {
          throw new ForbiddenException(t('insufficientPermissions', lang));
        }
      }

      return true;
    }

    return true;
  }
}