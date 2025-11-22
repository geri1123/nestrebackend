import { Module } from '@nestjs/common';
import { DeleteInactiveUsersCron } from './cron_delete_user.service';
import { UserModule } from '../modules/users/users.module';
import { UserCleanupService } from './user_cleanUp.service';
import { AgencyModule } from '../modules/agency/agency.module';
import { RegistrationRequestModule } from '../modules/registration-request/registration_request.module';

@Module({
    imports: [UserModule , AgencyModule , RegistrationRequestModule],          
  providers: [DeleteInactiveUsersCron, UserCleanupService],
})
export class CronJobsModule {}