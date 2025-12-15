
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '../../infrastructure/config/config.module';
import { AppConfigService } from '../../infrastructure/config/config.service';

@Module({
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: '1d' },
      }),
      inject: [AppConfigService],
    }),
  ],
  exports: [JwtModule, AppConfigModule],
})
export class SharedAuthModule {}