import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { RegisterAgencyOwnerDto } from '../../dto/register-agency-owner.dto';


import { SupportedLang, t } from '../../../../locales';
import { agency_status } from '@prisma/client';
import { CreateAgencyUseCase } from '../../../agency/application/use-cases/create-agency.use-case';
import { RegisterUserUseCase } from './register-user.use-case';
import { ValidateAgencyBeforeRegisterUseCase } from '../../../agency/application/use-cases/validate-agency-before-register.use-case';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class RegisterAgencyOwnerUseCase {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly createAgencyUseCase: CreateAgencyUseCase,
    private readonly validateAgencyUseCase: ValidateAgencyBeforeRegisterUseCase,
    private readonly prisma: PrismaService,  
  ) {}

  async execute(dto: RegisterAgencyOwnerDto, lang: SupportedLang) {
    
   
    await this.validateAgencyUseCase.execute(
      {
        agency_name: dto.agency_name,
        license_number: dto.license_number,
        address: dto.address,
      },
      lang,
    );

   
    const result = await this.prisma.$transaction(async (tx) => {

     
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
        tx,   
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
        tx,   
      );

      return { userId, agencyId };
    });

   
    return {
      ...result,
      message: t('registrationSuccess', lang),
    };
  }
}

// @Injectable()
// export class RegisterAgencyOwnerUseCase {
//   constructor(
//     private readonly registerUser: RegisterUserUseCase,
//     private readonly createAgencyUseCase: CreateAgencyUseCase,
//     private readonly validateAgencyUseCase: ValidateAgencyBeforeRegisterUseCase,
//   ) {}

//   async execute(dto: RegisterAgencyOwnerDto, lang: SupportedLang) {

  
//     await this.validateAgencyUseCase.execute(
//       {
//         agency_name: dto.agency_name,
//         license_number: dto.license_number,
//         address: dto.address,
//       },
//       lang,
//     );

  
//     const { userId } = await this.registerUser.execute(
//       {
//         username: dto.username,
//         email: dto.email,
//         password: dto.password,
//         first_name: dto.first_name,
//         last_name: dto.last_name,
//       },
//       lang,
//       'agency_owner',
//     );

   
//     const agencyId = await this.createAgencyUseCase.execute(
//       {
//         agency_name: dto.agency_name,
//         license_number: dto.license_number,
//         address: dto.address,
//       },
//       userId,
//       agency_status.inactive,
//       lang,
//     );

//     return {
//       userId,
//       agencyId,
//       message: t('registrationSuccess', lang),
//     };
//   }
// }

// CREATE AGENCY
    // const agencyId = await this.createagencyusecase.execute({
    //   agency_name: dto.agency_name,
    //   license_number: dto.license_number,
    //   address: dto.address,
    //   owner_user_id: userId,
    //   status: agency_status.inactive,
    // });