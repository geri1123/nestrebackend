import { Module } from '@nestjs/common';
import { DeleteInactiveUsersCron } from './cron_delete_user.service';
import { UserModule } from '../modules/users/users.module';
import { UserCleanupService } from './user_cleanUp.service';
import { AgencyModule } from '../modules/agency/agency.module';
import { RegistrationRequestModule } from '../modules/registration-request/registration_request.module';
import { AdvertiseProductModule } from '../modules/advertise_product/advertise-product.module';
import { UpdateExpiredAdvertisementCron } from './cron_update_advertisement';

@Module({
    imports: [UserModule , AgencyModule , RegistrationRequestModule , AdvertiseProductModule],          
  providers: [DeleteInactiveUsersCron, UserCleanupService , UpdateExpiredAdvertisementCron],
})
export class CronJobsModule {}