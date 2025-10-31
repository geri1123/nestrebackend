import { Module } from '@nestjs/common';

import { RegistrationRequestModule } from '../registration-request/registration.request.module';

import { AgencyRepository } from '../repositories/agency/agency.repository';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
@Module({
  controllers: [AgencyController],
  
  providers: [AgencyRepository, AgencyService ],
  exports: [ AgencyService ,AgencyRepository],
})
export class AgencyModule {}