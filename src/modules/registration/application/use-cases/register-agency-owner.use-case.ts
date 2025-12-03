import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { RegisterAgencyOwnerDto } from '../../dto/register-agency-owner.dto';

import { USERS_REPOSITORY_TOKENS } from '../../../users/domain/repositories/user.repository.tokens';
import {type IUserDomainRepository } from '../../../users/domain/repositories/user.repository.interface';

import { EmailService } from '../../../../infrastructure/email/email.service';
import { CacheService } from '../../../../infrastructure/cache/cache.service';
import { generateToken } from '../../../../common/utils/hash';
import { SupportedLang, t } from '../../../../locales';
import { agency_status } from '@prisma/client';
import { CheckAgencyNameExistsUseCase } from '../../../agency/application/use-cases/check-agency-name-exists.use-case';
import { CreateAgencyUseCase } from '../../../agency/application/use-cases/create-agency.use-case';
import { RegisterUserUseCase } from './register-user.use-case';

@Injectable()
export class RegisterAgencyOwnerUseCase {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly createAgencyUseCase: CreateAgencyUseCase,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
  ) {}

  async execute(dto: RegisterAgencyOwnerDto, lang: SupportedLang) {
  
const { userId, token } = await this.registerUser.execute(
  {
    username: dto.username,
    email: dto.email,
    password: dto.password,
    first_name: dto.first_name,
    last_name: dto.last_name,
  },
  lang,
  'agency_owner',
  
);
    
    const agencyId = await this.createAgencyUseCase.execute(
      {
        agency_name: dto.agency_name,
        license_number: dto.license_number,
        address: dto.address,
      },
      userId,
      agency_status.inactive,
      lang,
    );

   
    const cacheKey = `email_verification:${token}`;
    await this.cacheService.set(cacheKey, { userId, role: 'agency_owner' }, 30 * 60 * 1000);

    await this.emailService.sendVerificationEmail(
      dto.email,
      dto.first_name || dto.username,
      token,
      lang,
    );

    
    return {
      userId,
      agencyId,
      message: t('registrationSuccess', lang),
    };
  }
}

// CREATE AGENCY
    // const agencyId = await this.createagencyusecase.execute({
    //   agency_name: dto.agency_name,
    //   license_number: dto.license_number,
    //   address: dto.address,
    //   owner_user_id: userId,
    //   status: agency_status.inactive,
    // });