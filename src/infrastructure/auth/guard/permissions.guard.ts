import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { SupportedLang, t } from '../../../locales';
import { PERMISSIONS_KEY } from '../../../common/decorators/permissions.decorator';
import { UserRole } from '@prisma/client';

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

    if ((req as any).skipPermissionCheck === true) {
      return true;
    }

    if (!req.user) {
      throw new ForbiddenException(t('userNotAuthenticated', lang));
    }

    if (req.user.role === UserRole.agency_owner) {
      return true;
    }

    if (req.user.role === UserRole.agent) {
      return this.validateAgentPermissions(req, requiredPermissions, lang);
    }

    return true;
  }

  
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

