
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user.interface';
import { SupportedLang, t } from '../../locales';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AgentPermissionEntity } from '../../modules/agent/domain/entities/agent-permission.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { user_role } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
if (isPublic) {
      console.log('=== PERMISSIONS GUARD: Public route, skipping checks ===');
      return true;
    }
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    console.log('=== PERMISSIONS GUARD DEBUG ===');
    console.log('Required Permissions:', requiredPermissions);
   
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('No permissions required, allowing access');
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    console.log('User Role:', req.user?.role);
    console.log('Agency Agent ID:', req.agencyAgentId);
    console.log('Agent Permissions:', req.agentPermissions);

    if (!req.user) {
      console.log('No user found, denying access');
      throw new ForbiddenException(t('userNotAuthenticated', lang));
    }

    // Agency Owner full access
    if (req.user.role === 'agency_owner') {
      console.log('User is agency_owner, granting full access');
      return true;
    }

    // agent: check assigned permissions
    if (req.user.role === user_role.agent) {
      if (!req.agencyAgentId) {
        console.log('Agent has no agencyAgentId, denying access');
        throw new ForbiddenException(t('insufficientPermissions', lang));
      }

      const permissions = req.agentPermissions;
      if (!permissions) {
        console.log('Agent has no permissions object, denying access');
        throw new ForbiddenException(t('insufficientPermissions', lang));
      }

      //  permission checking
      for (const perm of requiredPermissions) {
        const permValue = (permissions as any)[perm];
        console.log(`Checking permission '${perm}':`, permValue);
        
        if (permValue !== true) {
          console.log(`Permission '${perm}' is false, denying access`);
          throw new ForbiddenException(t('insufficientPermissions', lang));
        }
      }
      
      console.log('All permissions passed, granting access');
      return true;
    }

    console.log('User role not agent or agency_owner, granting access by default');
    return true;
  }
}
