import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { RegisterAgencyOwnerDto } from '../../dto/register-agency-owner.dto';


import { SupportedLang, t } from '../../../../locales';
import { agency_status } from '@prisma/client';
import { CreateAgencyUseCase } from '../../../agency/application/use-cases/create-agency.use-case';
import { RegisterUserUseCase } from './register-user.use-case';
import { ValidateAgencyBeforeRegisterUseCase } from '../../../agency/application/use-cases/validate-agency-before-register.use-case';
@Injectable()
export class RegisterAgencyOwnerUseCase {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly createAgencyUseCase: CreateAgencyUseCase,
    private readonly validateAgencyUseCase: ValidateAgencyBeforeRegisterUseCase,
  ) {}

  async execute(dto: RegisterAgencyOwnerDto, lang: SupportedLang) {

    // 1️⃣ Validate agency BEFORE creating the user
    await this.validateAgencyUseCase.execute(
      {
        agency_name: dto.agency_name,
        license_number: dto.license_number,
        address: dto.address,
      },
      lang,
    );

    // 2️⃣ Create the user
    const { userId } = await this.registerUser.execute(
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

    // 3️⃣ Create agency
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