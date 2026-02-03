

// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { RequestWithUser } from '../types/request-with-user.interface';
// import { t, SupportedLang } from '../../locales';
// import { user_role, user_status, agencyagent_status, agency_status } from '@prisma/client';

// @Injectable()
// export class StatusGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const req = context.switchToHttp().getRequest<RequestWithUser>();
//     const lang: SupportedLang = req.language || 'al';

//     if (!req.user) return true;

//     // Check user suspension
//     if (req.user.status === user_status.suspended) {
//       throw new ForbiddenException(t('accountSuspended', lang));
//     }

//     // Check agent status (requires AgencyContextGuard to run first)
//     if (req.user.role === user_role.agent) {
//       if (req.agentStatus !== agencyagent_status.active) {
//         throw new ForbiddenException(t('agentInactive', lang));
//       }

//       if (req.agencyStatus === agency_status.suspended) {
//         throw new ForbiddenException(t('agencySuspended', lang));
//       }
//     }

//     // Check agency owner status
//     if (req.user.role === user_role.agency_owner) {
//       if (req.agencyStatus === agency_status.suspended) {
//         throw new ForbiddenException(t('agencySuspended', lang));
//       }
//     }

//     return true;
//   }
// }