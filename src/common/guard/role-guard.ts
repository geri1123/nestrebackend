import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupportedLang, t } from '../../locales';
import { RequestWithUser } from '../types/request-with-user.interface'; // create this interface

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
   
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) return true; 

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al'; 

    if (!req.user) {
      throw new ForbiddenException(
        t('userNotAuthenticated', lang));
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    return true;
  }
}
