
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { t, SupportedLang } from '../../../locales';
import { user_role, user_status } from '@prisma/client';
import { REQUIRE_AGENCY_CONTEXT } from '../../../common/decorators/require-agency-context.decorator';
import { AgencyContextService } from '../services/agency-context.service';

@Injectable()
export class AgencyContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly agencyContextService: AgencyContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const lang: SupportedLang = req.language || 'al';

    this.checkUserSuspension(req, lang);

    if (this.isAgencyContextLoaded(req)) {
      this.agencyContextService.checkAgencyAndAgentStatus(req, lang);
      return true;
    }

    const requireAgencyContext = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_AGENCY_CONTEXT,
      [context.getHandler(), context.getClass()]
    );

    if (!this.shouldLoadAgencyContext(req, requireAgencyContext)) {
      return true;
    }

    await this.agencyContextService.loadAgencyContext(req, lang);

    this.agencyContextService.checkAgencyAndAgentStatus(req, lang);

    return true;
  }

  
  private checkUserSuspension(req: RequestWithUser, lang: SupportedLang): void {
    if (req.user && req.user.status === user_status.suspended) {
      throw new ForbiddenException(t('accountSuspended', lang));
    }
  }

  
  private isAgencyContextLoaded(req: RequestWithUser): boolean {
    return req.agencyId !== undefined;
  }

  
  private shouldLoadAgencyContext(req: RequestWithUser, requireAgencyContext: boolean): boolean {
    const { user } = req;
    
    if (!user) return false;
    if (!requireAgencyContext) return false;
    
    return user.role === user_role.agent || user.role === user_role.agency_owner;
  }
}