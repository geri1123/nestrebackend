import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AgencyRepository } from './infrastructure/persistence/agency.repository';

// Use-cases
import { CreateAgencyUseCase } from './application/use-cases/create-agency.use-case';
import { DeleteAgencyLogoUseCase } from './application/use-cases/delete-agency-logo.use-case';
import { UpdateAgencyFieldsUseCase } from './application/use-cases/update-agency-fields.use-case';
import { UploadAgencyLogoUseCase } from './application/use-cases/upload-logo.use-case';
import { GetPaginatedAgenciesUseCase } from './application/use-cases/get-paginated-agencies.use-case';
import { GetAgencyByIdUseCase } from './application/use-cases/get-agency-by-id.use-case';
import { GetAgencyInfoUseCase } from './application/use-cases/get-agency-info.use-case';
import { RegisterAgencyFromUserUseCase } from './application/use-cases/register-agency-from-user.use-case';
import { GetAgencyWithOwnerByIdUseCase } from './application/use-cases/get-agency-with-owner-byid.use-case';
import { GetAgencyByOwnerUseCase } from './application/use-cases/get-agency-by-owner.use-case';
import { GetAgencyByPublicCodeUseCase } from './application/use-cases/check-public-code.use-case';
import { DeleteAgencyByOwnerUseCase } from './application/use-cases/delete-agency-by-owner.use-case';
import { ActivateAgencyByOwnerUseCase } from './application/use-cases/activate-agency-by-owner.use-case';
import { CheckAgencyNameExistsUseCase } from './application/use-cases/check-agency-name-exists.use-case';
import { CheckLicenseExistsUseCase } from './application/use-cases/check-license-exists.use-case';
import { ValidateAgencyBeforeRegisterUseCase } from './application/use-cases/validate-agency-before-register.use-case';
import { AGENCY_REPO } from './domain/repositories/agency.repository.interface';
import { CommonModule } from '../../common/common.module';

// Controller
import { AgencyController } from './controllers/agency.controller';

// Extra utils
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule,
    CommonModule
  ],

  controllers: [AgencyController],

  providers: [
    // REPOSITORY
    {
      provide: AGENCY_REPO,
      useClass: AgencyRepository,
    },

    // USE-CASES (all the use cases)
    ValidateAgencyBeforeRegisterUseCase,
    DeleteAgencyByOwnerUseCase,
    GetAgencyByOwnerUseCase,
    CreateAgencyUseCase,
    DeleteAgencyLogoUseCase,
    UpdateAgencyFieldsUseCase,
    UploadAgencyLogoUseCase,
    GetPaginatedAgenciesUseCase,
    GetAgencyByIdUseCase,
    GetAgencyInfoUseCase,
    RegisterAgencyFromUserUseCase,
    GetAgencyByPublicCodeUseCase,
    GetAgencyWithOwnerByIdUseCase,
    ActivateAgencyByOwnerUseCase,
    CheckAgencyNameExistsUseCase,
    CheckLicenseExistsUseCase,
  ],

  exports: [
    // Export use cases that other modules need
    DeleteAgencyByOwnerUseCase,
    CreateAgencyUseCase,
    GetAgencyByIdUseCase,
    ValidateAgencyBeforeRegisterUseCase,
    GetAgencyInfoUseCase,
    RegisterAgencyFromUserUseCase,
    GetAgencyByPublicCodeUseCase,
    GetAgencyWithOwnerByIdUseCase,
    ActivateAgencyByOwnerUseCase,
    CheckAgencyNameExistsUseCase,
    CheckLicenseExistsUseCase,
    GetAgencyByOwnerUseCase,
    AGENCY_REPO
  ],
})
export class AgencyModule {}