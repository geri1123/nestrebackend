import { Module } from '@nestjs/common';


import { AgencyRepository } from '../../repositories/agency/agency.repository';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { ManageAgencyService } from './manage-agency.service';
@Module({
  controllers: [AgencyController],
  
  providers: [AgencyRepository, AgencyService , ManageAgencyService ],
  exports: [ AgencyService ,AgencyRepository],
})
export class AgencyModule {}