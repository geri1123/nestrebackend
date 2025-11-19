import { Module } from '@nestjs/common';


import { AgencyRepository } from '../../repositories/agency/agency.repository';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { ManageAgencyService } from './manage-agency.service';
import { ImageUtilsService } from '../../common/utils/image-utils.service';
import { AgencyCreationService } from './agency-creation.service';
import { UserModule } from '../users/users.module';
@Module({
  imports:[UserModule],
  controllers: [AgencyController],
  
  providers: [AgencyRepository, AgencyService ,ImageUtilsService, ManageAgencyService , AgencyCreationService ],
  exports: [ AgencyService ,AgencyRepository],
})
export class AgencyModule {}