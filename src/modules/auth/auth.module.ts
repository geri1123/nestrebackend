import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { EmailModule } from '../../infrastructure/email/email.module';


import { RegistrationRequestModule } from '../registration-request/registration-request.module';



import { NotificationModule } from '../notification/notification.module';
import { AgencyModule } from '../agency/agency.module';

import { AppConfigModule } from '../../infrastructure/config/config.module';
import { AgentModule } from '../agent/agent.module';
import { UsersModule } from '../users/users.module';
import { AppConfigService } from '../../infrastructure/config/config.service';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
import { RegistrationModule } from '../registration/registration.module';


@Module({
  imports: [
    NotificationModule,
    EmailModule,
    UsersModule,
    RegistrationModule,
    // AppConfigModule,
    AgencyModule,
    AgentModule,
    RegistrationRequestModule,
    AppCacheModule,
  
   JwtModule.registerAsync({
  imports: [AppConfigModule],
  useFactory: async (configService: AppConfigService) => ({
    secret: configService.jwtSecret, 
    signOptions: { expiresIn: '1d' },
  }),
  inject: [AppConfigService],
}),
  ],
  providers: [
   
   AuthService,
  
  
 
  ],
  controllers: [
    AuthController,
  
   
  ],
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}
