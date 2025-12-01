import { Inject, Injectable } from '@nestjs/common';
import { agency_status, user_role } from '@prisma/client';
import { CreateAgencyUseCase , CreateAgencyData } from './create-agency.use-case';
import { UpdateUserProfileUseCase } from '../../../users/application/use-cases/update-user-profile.use-case';
import { SupportedLang } from '../../../../locales';
import { validate } from 'class-validator';
import { throwValidationErrors } from '../../../../common/helpers/validation.helper';
import { USERS_REPOSITORY_TOKENS } from '../../../users/domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';

@Injectable()
export class RegisterAgencyFromUserUseCase {
  constructor(
    private readonly createAgency: CreateAgencyUseCase,
    @Inject(USERS_REPOSITORY_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserDomainRepository,
  ) {}

  async execute(
    data: CreateAgencyData,
    userId: number,
    language: SupportedLang = 'al',
  ): Promise<{ agencyId: number }> {
    // Update user role to agency_owner
    await this.userRepository.updateFields(userId, { role: user_role.agency_owner });

    // Create agency
    const agencyId = await this.createAgency.execute(
      data,
      userId,
      agency_status.active,
      language,
    );

    return { agencyId };
  }
}