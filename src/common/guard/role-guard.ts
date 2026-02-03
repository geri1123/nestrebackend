// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { SupportedLang, t } from '../../locales';
// import { RequestWithUser } from '../types/request-with-user.interface'; // create this interface

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private readonly reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
   
//     const roles = this.reflector.getAllAndOverride<string[]>('roles', [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (!roles) return true; 

//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al'; 

//     if (!req.user) {
//       throw new ForbiddenException(
//         t('userNotAuthenticated', lang));
//     }

//     if (!roles.includes(req.user.role)) {
//       throw new ForbiddenException(t('insufficientPermissions', lang));
//     }

//     return true;
//   }
// }
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupportedLang, t } from '../../locales';
import { RequestWithUser } from '../types/request-with-user.interface';
import { Roles, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || roles.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang = req.language || 'al';

    if (!req.user) throw new ForbiddenException(t('userNotAuthenticated', lang));

    // Convert enum to string just in case
    const userRole = String(req.user.role);

    if (!roles.includes(userRole)) {
      console.log('Blocked by RolesGuard:', userRole, 'required:', roles);
      throw new ForbiddenException(t('insufficientPermissions', lang));
    }

    return true;
  }
}