import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ Add this import
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ Add this if using ConfigService
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordController } from './password.controller';
import { EmailModule } from '../email/email.module';
import { PasswordRecoveryService } from './password.service';
import { AgencyRepository } from '../repositories/agency/agency.repository';
import { RegistrationRequestModule } from '../registration-request/registration.request.module';
import { AgentsRepository } from '../repositories/agent/agent.repository';
import { UserRepository } from '../repositories/user/user.repository';
import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
import { PasswordResetTokenRepository } from '../repositories/passwordReset/password-reset.repository';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { NotificationModule } from '../notification/notification.module';
import { AgencyModule } from '../agency/agency.module';
import { UserModule } from '../users/users.module';
@Module({
  imports: [
  NotificationModule,
    EmailModule,
    UserModule,
     AgencyModule,
    RegistrationRequestModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: {
          expiresIn: '1d', 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    
   EmailVerificationService,
   PasswordRecoveryService,
    PasswordResetTokenRepository
  ],
  controllers: [AuthController, PasswordController , EmailVerificationController],
  exports: [AuthService, JwtModule ], 
})
export class AuthModule {}