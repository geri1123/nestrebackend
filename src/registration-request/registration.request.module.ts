import { Module } from '@nestjs/common';
import { RegistrationRequestService } from './registration.request.service';
import { NotificationModule } from '../notification/notification.module';
import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
import { AgencyModule } from '../agency/agency.module';

@Module({
  imports: [NotificationModule , AgencyModule], 
  providers: [
    RegistrationRequestService,
    RegistrationRequestRepository,
  ],
  exports: [
    RegistrationRequestService, RegistrationRequestRepository
  ],
})
export class RegistrationRequestModule {}