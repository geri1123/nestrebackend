import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPO, type IUserDomainRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { t, SupportedLang } from '../../../../locales';
import { UserRole } from '@prisma/client';
import {
  AGENT_PROFILE_PORT,
  type IAgentProfilePort,
  type AgentProfileData,
} from '../../../agent/application/ports/agent-profile.port';
import {
  AGENCY_OWNER_PROFILE_PORT,
  type IAgencyOwnerProfilePort,
  type AgencyData,
} from '../../../agency/application/ports/agency-owner-profile.port';
 
export interface UserProfileData {
  user: User;
  agentProfile?: AgentProfileData;
  agency?: AgencyData;
}
 
@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
    @Inject(AGENT_PROFILE_PORT)
    private readonly agentProfilePort: IAgentProfilePort,
    @Inject(AGENCY_OWNER_PROFILE_PORT)
    private readonly agencyOwnerProfilePort: IAgencyOwnerProfilePort,
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
 
    if (user.role === UserRole.agent) {
      result.agentProfile = await this.agentProfilePort.getAgentProfileData(userId, language);
    }
 
    if (user.role === UserRole.agency_owner) {
      result.agency = await this.agencyOwnerProfilePort.getAgencyData(userId, language);
    }
 
    return result;
  }
}
 