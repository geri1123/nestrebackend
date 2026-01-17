
// import { Injectable } from '@nestjs/common';
// import { RegisterAgencyOwnerDto } from '../../dto/register-agency-owner.dto';
// import { SupportedLang, t } from '../../../../locales';
// import { agency_status } from '@prisma/client';
// import { CreateAgencyUseCase } from '../../../agency/application/use-cases/create-agency.use-case';
// import { RegisterUserUseCase, RegisterUserResult } from './register-user.use-case';
// import { ValidateAgencyBeforeRegisterUseCase } from '../../../agency/application/use-cases/validate-agency-before-register.use-case';
// import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
// import { EmailService } from '../../../../infrastructure/email/email.service';
// import { CacheService } from '../../../../infrastructure/cache/cache.service';

// @Injectable()
// export class RegisterAgencyOwnerUseCase {
//   constructor(
//     private readonly registerUser: RegisterUserUseCase,
//     private readonly createAgencyUseCase: CreateAgencyUseCase,
//     private readonly validateAgencyUseCase: ValidateAgencyBeforeRegisterUseCase,
//     private readonly prisma: PrismaService,
//     private readonly emailService: EmailService,
//     private readonly cacheService: CacheService,
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

//     // Return both result AND userData from transaction
//     const { result, userData } = await this.prisma.$transaction(async (tx) => {
//       const userData = await this.registerUser.execute(
//         {
//           username: dto.username,
//           email: dto.email,
//           password: dto.password,
//           first_name: dto.first_name,
//           last_name: dto.last_name,
//         },
//         lang,
//         'agency_owner',
//         tx,
//         true
//       );

//       const agencyId = await this.createAgencyUseCase.execute(
//         {
//           agency_name: dto.agency_name,
//           license_number: dto.license_number,
//           address: dto.address,
//         },
//         userData.userId,
//         agency_status.inactive,
//         lang,
//         tx,
//       );

//       return { 
//         result: { userId: userData.userId, agencyId },
//         userData 
//       };
//     });

//     // Send verification email AFTER successful transaction
//     await this.cacheService.set(
//       `email_verification:${userData.token}`,
//       { userId: userData.userId, role: userData.role },
//       30 * 60 * 1000
//     );

//     await this.emailService.sendVerificationEmail(
//       userData.email,
//       userData.firstName,
//       userData.token,
//       lang,
//     );

//     return {
//       ...result,
//       message: t('registrationSuccess', lang),
//     };
//   }
// }


import { Injectable } from '@nestjs/common';
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

    const { result, userData } = await this.prisma.$transaction(async (tx) => {
      const userData = await this.registerUser.execute(
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
        true // Skip email
      );

      const agencyId = await this.createAgencyUseCase.execute(
        {
          agency_name: dto.agency_name,
          license_number: dto.license_number,
          address: dto.address,
        },
        userData.userId,
        agency_status.inactive,
        lang,
        tx,
      );

      return { 
        result: { userId: userData.userId, agencyId },
        userData 
      };
    });

    // Send email AFTER transaction using the dedicated method
    await this.registerUser.sendVerificationEmail(
      userData.userId,
      userData.token,
      userData.email,
      userData.firstName,
      userData.role,
      lang
    );

    return {
      ...result,
      message: t('registrationSuccess', lang),
    };
  }
}