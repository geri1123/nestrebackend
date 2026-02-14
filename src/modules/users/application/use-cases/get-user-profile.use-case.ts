import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { t, SupportedLang } from '../../../../locales';
import { agencyagent_role_in_agency, user_role } from '@prisma/client';
import { AgentContextService } from '../../../../infrastructure/auth/services/agent-context.service';
import { AgencyOwnerContextService } from '../../../../infrastructure/auth/services/agency-owner-context.service';
import { AgentStatus } from '../../../agent/domain/types/agent-status.type';
import { AgencyStatus } from '../../../agency/domain/types/agency-status.type';
import { AgentPermissions } from '../../../../common/types/permision.type';
import { AgentPermissionsResponse } from '../../responses/types/agent-permissions.response.type';

export interface UserProfileData {
  user: User;
  agentProfile?: {
    agencyAgentId: number;
    roleInAgency: agencyagent_role_in_agency;
    status: AgentStatus;
    commissionRate: number | null;
    startDate: Date | null;
    updatedAt: Date | null;
    permissions: AgentPermissions;
    agency: {
      id: number;
      name: string;
      email: string | null;
      logo: string | null;
      website: string | null;
      status: AgencyStatus;
    };
  };
  agency?: {
    id: number;
    name: string;
    email: string | null;
    logo: string | null;
    status: AgencyStatus;
    address: string | null;
    phone: string | null;
    website: string | null;
    licenseNumber: string;
    publicCode: string | null;
  };
}

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPO) private readonly userRepository: IUserDomainRepository,
    private readonly agentContextService: AgentContextService,
    private readonly agencyOwnerContextService: AgencyOwnerContextService,
  ) {}

  async execute(userId: number, language: SupportedLang = 'al'): Promise<UserProfileData> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: t('validationFailed', language),
        errors: { user: [t('userNotFound', language)] },
      });
    }

    const result: UserProfileData = { user };

    // Add agent profile if user is an agent
    if (user.role === user_role.agent) {
      result.agentProfile = await this.agentContextService.getAgentProfileData(userId, language);
    }

    // Add agency if user is an agency owner
    if (user.role === user_role.agency_owner) {
      result.agency = await this.agencyOwnerContextService.getAgencyData(userId, language);
    }

    return result;
  }
}
// import { Inject, Injectable, NotFoundException } from '@nestjs/common';
// import {USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
// import { User } from '../../domain/entities/user.entity';
// import { t, SupportedLang } from '../../../../locales';
// import { format } from 'path';

// @Injectable()
// export class GetUserProfileUseCase {
//   constructor(  
//         @Inject(USER_REPO)
    
//     private readonly userRepository: IUserDomainRepository,) {}

//   async execute(userId: number, language: SupportedLang = 'al'): Promise<User> {
//     const user = await this.userRepository.findById(userId);
    
//     if (!user) {
//       throw new NotFoundException({
//         success: false,
//         message: t('validationFailed', language),
//         errors: { user: [t('userNotFound', language)] },
//       });
//     }
 
//     return user;
//   }
// }