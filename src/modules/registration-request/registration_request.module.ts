import { Module } from '@nestjs/common';
import { RegistrationRequestService } from './registration_request.service';
import { NotificationModule } from '../notification/notification.module';
import { RegistrationRequestRepository } from '../../repositories/registration-request/registration-request.repository';
import { AgencyModule } from '../agency/agency.module';
import { AgentModule } from '../agent/agent.module';
import { RegistrationRequestController } from './registration_request.controller';

@Module({
  imports: [NotificationModule , AgencyModule , AgentModule], 
  controllers:[RegistrationRequestController],
  providers: [
    RegistrationRequestService,
    RegistrationRequestRepository,
  ],
  exports: [
    RegistrationRequestService, RegistrationRequestRepository
  ],
})
export class RegistrationRequestModule {}