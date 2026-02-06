import { Injectable, ForbiddenException } from '@nestjs/common';
import { RequestWithUser } from '../../../common/types/request-with-user.interface';
import { t, SupportedLang } from '../../../locales';
import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { GetAgencyByIdUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-id.use-case';
import { user_role, agencyagent_status, agency_status } from '@prisma/client';
import { mapAgentPermissions } from '../../../common/helpers/permissions.helper';

@Injectable()
export class AgencyContextService {
  constructor(
    private readonly getAgentAuthContext: GetAgentAuthContextUseCase,
    private readonly getAgencyByOwner: GetAgencyByOwnerUseCase,
    private readonly getAgencyById: GetAgencyByIdUseCase,
  ) {}

  /**
   * Load agency context into the request based on user role
   */
  async loadAgencyContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
    const { user } = req;

    if (!user) return;

    if (user.role === user_role.agent) {
      await this.loadAgentContext(req, lang);
    } else if (user.role === user_role.agency_owner) {
      await this.loadAgencyOwnerContext(req, lang);
    }
  }

  /**
   * Load agent-specific context
   */
  private async loadAgentContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
    const agentContext = await this.getAgentAuthContext.execute(req.user!.id);
    
    if (!agentContext) {
      throw new ForbiddenException(t('userNotAssociatedWithAgency', lang));
    }

    req.agencyId = agentContext.agencyId;
    req.agencyAgentId = agentContext.agencyAgentId;
    req.agentPermissions = mapAgentPermissions(agentContext.permissions);
    req.agentStatus = agentContext.status;

    // Fetch agency status
    const agency = await this.getAgencyById.execute(agentContext.agencyId, lang);
    req.agencyStatus = agency.status;
  }

  /**
   * Load agency owner-specific context
   */
  private async loadAgencyOwnerContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
    const agency = await this.getAgencyByOwner.execute(req.user!.id, lang);
    req.agencyId = agency.id;
    req.agencyStatus = agency.status;
  }

  /**
   * Validate agency and agent status
   */
  checkAgencyAndAgentStatus(req: RequestWithUser, lang: SupportedLang): void {
    if (!req.user) return;

    // Check agent-specific status
    if (req.user.role === user_role.agent) {
      this.validateAgentStatus(req, lang);
      this.validateAgencyStatusForAgent(req, lang);
    }

    // Check agency owner status
    if (req.user.role === user_role.agency_owner) {
      this.validateAgencyStatusForOwner(req, lang);
    }
  }

  /**
   * Validate agent status
   */
  private validateAgentStatus(req: RequestWithUser, lang: SupportedLang): void {
    if (!req.agentStatus) return;

    if (req.agentStatus === agencyagent_status.inactive) {
      throw new ForbiddenException(t('agentInactive', lang));
    }

    if (req.agentStatus === agencyagent_status.terminated) {
      throw new ForbiddenException(t('agentTerminated', lang));
    }
  }

  /**
   * Validate agency status for agents
   */
  private validateAgencyStatusForAgent(req: RequestWithUser, lang: SupportedLang): void {
    if (req.agencyStatus === agency_status.suspended) {
      throw new ForbiddenException(t('agencySuspended', lang));
    }

    if (req.agencyStatus === agency_status.inactive) {
      throw new ForbiddenException(t('agencyInactive', lang));
    }
  }

  /**
   * Validate agency status for owners
   */
  private validateAgencyStatusForOwner(req: RequestWithUser, lang: SupportedLang): void {
    if (req.agencyStatus === agency_status.suspended) {
      throw new ForbiddenException(t('agencySuspended', lang));
    }
  }
}

// import { Injectable, ForbiddenException } from '@nestjs/common';
// import { RequestWithUser } from '../../../common/types/request-with-user.interface';
// import { t, SupportedLang } from '../../../locales';
// import { GetAgentAuthContextUseCase } from '../../../modules/agent/application/use-cases/get-agent-auth-context.use-case';
// import { GetAgencyByOwnerUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
// import { GetAgencyByIdUseCase } from '../../../modules/agency/application/use-cases/get-agency-by-id.use-case';
// import { user_role, agencyagent_status, agency_status } from '@prisma/client';
// import { mapAgentPermissions } from '../../../common/helpers/permissions.helper';

// @Injectable()
// export class AgencyContextService {
//   constructor(
//     private readonly getAgentAuthContext: GetAgentAuthContextUseCase,
//     private readonly getAgencyByOwner: GetAgencyByOwnerUseCase,
//     private readonly getAgencyById: GetAgencyByIdUseCase,
//   ) {}

//   async loadAgencyContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
//     const { user } = req;

//     if (!user) return;

//     if (user.role === user_role.agent) {
//       await this.loadAgentContext(req, lang);
//     } else if (user.role === user_role.agency_owner) {
//       await this.loadAgencyOwnerContext(req, lang);
//     }
//   }

//   private async loadAgentContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
//     const agentContext = await this.getAgentAuthContext.execute(req.user!.id);
    
//     if (!agentContext) {
//       throw new ForbiddenException(t('userNotAssociatedWithAgency', lang));
//     }

//     req.agencyId = agentContext.agencyId;
//     req.agencyAgentId = agentContext.agencyAgentId;
//     req.agentPermissions = mapAgentPermissions(agentContext.permissions);
//     req.agentStatus = agentContext.status;

//     const agency = await this.getAgencyById.execute(agentContext.agencyId, lang);
//     req.agencyStatus = agency.status;
//   }

//   private async loadAgencyOwnerContext(req: RequestWithUser, lang: SupportedLang): Promise<void> {
//     const agency = await this.getAgencyByOwner.execute(req.user!.id, lang);
//     req.agencyId = agency.id;
//     req.agencyStatus = agency.status;
//   }

//   checkAgencyAndAgentStatus(req: RequestWithUser, lang: SupportedLang): void {
//     if (!req.user) return;

//     // Check agent status
//     if (req.user.role === user_role.agent) {
//       if (req.agentStatus && req.agentStatus !== agencyagent_status.active) {
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
//   }
// }