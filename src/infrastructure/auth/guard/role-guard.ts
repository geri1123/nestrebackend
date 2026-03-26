import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupportedLang, t } from '../../../locales';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required - allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    if (!req.user) {
      throw new ForbiddenException(t('userNotAuthenticated', lang));
    }

    const userRole = String(req.user.role);

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    return true;
  }
}
