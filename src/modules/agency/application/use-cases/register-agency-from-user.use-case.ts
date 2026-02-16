import { Inject, Injectable } from '@nestjs/common';
import { AgencyStatus, UserRole } from '@prisma/client';
import { CreateAgencyUseCase , CreateAgencyData } from './create-agency.use-case';
import { UpdateUserProfileUseCase } from '../../../users/application/use-cases/update-user-profile.use-case';
import { SupportedLang } from '../../../../locales';

import { USERS_REPOSITORY_TOKENS } from '../../../users/domain/repositories/user.repository.tokens';
import {USER_REPO, type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class RegisterAgencyFromUserUseCase {
  constructor(
    private readonly createAgency: CreateAgencyUseCase,
    @Inject(USER_REPO)
    private readonly userRepository: IUserDomainRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    data: CreateAgencyData,
    userId: number,
    language: SupportedLang = 'al',
  ): Promise<{ agencyId: number }> {

    return this.prisma.$transaction(async (tx) => {

      
      const agencyId = await this.createAgency.execute(
        data,
        userId,
        AgencyStatus.active,
        language,
        tx,
      );

     
      await this.userRepository.updateFields(
        userId,
        { role: UserRole.agency_owner },
        tx,
      );

      return { agencyId };
    });
  }
}
