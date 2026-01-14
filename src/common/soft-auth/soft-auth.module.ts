import { Module } from '@nestjs/common';
import { AppConfigModule } from '../../infrastructure/config/config.module';
import { SoftAuthService } from './soft-auth.service';
import { UsersModule } from '../../modules/users/users.module';
import { SharedAuthModule } from '../../infrastructure/auth/modules/shared-auth.module';

@Module({
  imports: [
    UsersModule,
    AppConfigModule,
   SharedAuthModule,
  ],
  providers: [SoftAuthService],
  exports: [SoftAuthService],
})
export class SoftAuthModule {}
