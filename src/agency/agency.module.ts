import { Module } from '@nestjs/common';



import { EmailModule } from '../email/email.module';
import { AgencyRepository } from '../repositories/agency/agency.repository';

@Module({
  imports: [EmailModule ,AgencyRepository],
  providers: [ ],
  exports: [ ],
})
export class AgencyModule {}