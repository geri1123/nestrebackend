import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../../infrastructure/config/config.module';
import { AppConfigService } from '../../infrastructure/config/config.service';
import { SoftAuthService } from './soft-auth.service';
import { UsersModule } from '../../modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: '1d' },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [SoftAuthService],
  exports: [SoftAuthService],
})
export class SoftAuthModule {}
