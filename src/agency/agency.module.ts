import { Module } from '@nestjs/common';



import { AgencyRepository } from '../repositories/agency/agency.repository';
import { AgencyService } from './agency.service';

@Module({
  imports: [ ],
  providers: [AgencyRepository, AgencyService ],
  exports: [ AgencyService ,AgencyRepository],
})
export class AgencyModule {}