import { Module } from '@nestjs/common';
import { DeleteInactiveUsersCron } from './cron-delete-user.service';
import { UsersModule } from '../modules/users/users.module';

import { AgencyModule } from '../modules/agency/agency.module';
import { RegistrationRequestModule } from '../modules/registration-request/registration-request.module';

import { UpdateExpiredAdvertisementCron } from './cron-update-advertisement';
import { AdvertiseProductModule } from '../modules/advertise-product/advertise-product.module';
import { CleanupModule } from '../modules/cleanup/cleanup.module';

@Module({
    imports: [CleanupModule, AdvertiseProductModule],          
  providers: [DeleteInactiveUsersCron , UpdateExpiredAdvertisementCron],
})
export class CronJobsModule {}