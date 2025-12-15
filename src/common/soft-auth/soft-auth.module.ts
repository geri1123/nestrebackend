import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../../infrastructure/config/config.module';
import { AppConfigService } from '../../infrastructure/config/config.service';
import { SoftAuthService } from './soft-auth.service';
import { UsersModule } from '../../modules/users/users.module';
import { SharedAuthModule } from '../../infrastructure/auth/shared-auth.module';

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
