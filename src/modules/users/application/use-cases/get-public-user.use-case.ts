import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../../infrastructure/persistence/user.repository";
import { AgentRepository } from "../../../agent/infrastructure/persistence/agent.repository";
import { SupportedLang, t } from "../../../../locales";
import { IUserDomainRepository, USER_REPO } from "../../domain/repositories/user.repository.interface";
import { PublicUserProfile } from "../../domain/types/public-user-profile.type";
import { UserRole } from "@prisma/client";

@Injectable()
export class GetPublicUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: number, language: SupportedLang) {
    const user = await this.userRepository.findPublicById(userId);

    if (!user) throw new NotFoundException(t('userNotFound', language));

    const profile: PublicUserProfile = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      aboutMe: user.aboutMe,
      profileImgUrl: user.profileImgUrl,
      role: user.role,
      createdAt: user.createdAt,
      agency: null,
      roleInAgency: null,
    };

    // agency_owner
    if (user.role ===UserRole.agency_owner && user.agency) {
      profile.agency = user.agency;
    }

    // agent
    if (user.role === 'agent' && user.agencyAgentAgent.length > 0) {
      profile.agency = user.agencyAgentAgent[0].agency;
      profile.roleInAgency = user.agencyAgentAgent[0].roleInAgency;
    }

    return profile;
  }
}