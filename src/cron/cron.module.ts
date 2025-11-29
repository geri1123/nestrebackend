import { Module } from '@nestjs/common';
import { DeleteInactiveUsersCron } from './cron-delete-user.service';
import { UserModule } from '../modules/users/users.module';
import { UserCleanupService } from './user-cleanUp.service';
import { AgencyModule } from '../modules/agency/agency.module';
import { RegistrationRequestModule } from '../modules/registration-request/registration-request.module';

import { UpdateExpiredAdvertisementCron } from './cron-update-advertisement';
import { AdvertiseProductModule } from '../modules/advertise-product/advertise-product.module';

@Module({
    imports: [UserModule , AgencyModule , RegistrationRequestModule , AdvertiseProductModule],          
  providers: [DeleteInactiveUsersCron, UserCleanupService , UpdateExpiredAdvertisementCron],
})
export class CronJobsModule {}