import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordController } from './password.controller';
import { EmailModule } from '../../infrastructure/email/email.module';
import { PasswordRecoveryService } from './password.service';

import { RegistrationRequestModule } from '../registration-request/registration.request.module';

import { PasswordResetTokenRepository } from '../../repositories/passwordReset/password-reset.repository';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { NotificationModule } from '../notification/notification.module';
import { AgencyModule } from '../agency/agency.module';

import { AppConfigModule } from '../../infrastructure/config/config.module';
import { AgentModule } from '../agent/agent.module';
import { UserModule } from '../users/users.module';


@Module({
  imports: [
    NotificationModule,
    EmailModule,
    UserModule,
    AppConfigModule,
    AgencyModule,
    AgentModule,
    RegistrationRequestModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
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
