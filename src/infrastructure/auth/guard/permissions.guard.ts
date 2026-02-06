import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../../locales';
import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
import { user_role } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // No permissions required - allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    // Allow skipping permission check if explicitly set
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

    // Validate agent permissions
    if (req.user.role === user_role.agent) {
      return this.validateAgentPermissions(req, requiredPermissions, lang);
    }

    return true;
  }

  /**
   * Validate that agent has all required permissions
   */
  private validateAgentPermissions(
    req: RequestWithUser,
    requiredPermissions: string[],
    lang: SupportedLang
  ): boolean {
    if (!req.agencyAgentId || !req.agentPermissions) {
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    for (const permission of requiredPermissions) {
      if ((req.agentPermissions as any)[permission] !== true) {
        throw new ForbiddenException(t('insufficientPermissions', lang));
      }
    }

    return true;
  }
}

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { RequestWithUser } from '../../../common/types/request-with-user.interface';
// import { SupportedLang, t } from '../../../locales';
// import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
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

//     if ((req as any).skipPermissionCheck === true) {
//       return true;
//     }

//     if (!req.user) {
//       throw new ForbiddenException(t('userNotAuthenticated', lang));
//     }

//     if (req.user.role === user_role.agency_owner) {
//       return true;
//     }

//     if (req.user.role === user_role.agent) {
//       if (!req.agencyAgentId || !req.agentPermissions) {
//         throw new ForbiddenException(t('insufficientPermissions', lang));
//       }

//       for (const perm of requiredPermissions) {
//         if ((req.agentPermissions)[perm] !== true) {
//           throw new ForbiddenException(t('insufficientPermissions', lang));
//         }
//       }

//       return true;
//     }

//     return true;
//   }
// }