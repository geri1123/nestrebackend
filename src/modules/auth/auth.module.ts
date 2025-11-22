import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordController } from './password.controller';
import { EmailModule } from '../../infrastructure/email/email.module';
import { PasswordRecoveryService } from './password.service';

import { RegistrationRequestModule } from '../registration-request/registration_request.module';

import { PasswordResetTokenRepository } from '../../repositories/passwordReset/password-reset.repository';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { NotificationModule } from '../notification/notification.module';
import { AgencyModule } from '../agency/agency.module';

import { AppConfigModule } from '../../infrastructure/config/config.module';
import { AgentModule } from '../agent/agent.module';
import { UserModule } from '../users/users.module';
import { AppConfigService } from '../../infrastructure/config/config.service';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';


@Module({
  imports: [
    NotificationModule,
    EmailModule,
    UserModule,
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
  EmailVerificationService,
  PasswordRecoveryService,
  PasswordResetTokenRepository,
  ],
  controllers: [
    AuthController,
    PasswordController,
    EmailVerificationController,
  ],
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}
