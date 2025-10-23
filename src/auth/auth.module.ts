import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ Add this import
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ Add this if using ConfigService
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordController } from './password.controller';
import { EmailModule } from '../email/email.module';
import { PasswordRecoveryService } from './password.service';
import { AgencyRepository } from '../repositories/agency/agency.repository';

import { AgentsRepository } from '../repositories/agent/agent.repository';
import { UserRepository } from '../repositories/user/user.repository';
import { RegistrationRequestRepository } from '../repositories/registration-request/registration-request.repository';
import { PasswordResetTokenRepository } from '../repositories/passwordReset/password-reset.repository';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
@Module({
  imports: [
  
    EmailModule,
    
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
    //  PrismaService, 
    AgencyRepository, 
    AgentsRepository,
    PasswordRecoveryService,
    UserRepository,
    RegistrationRequestRepository,
    PasswordResetTokenRepository
  ],
  controllers: [AuthController, PasswordController , EmailVerificationController],
  exports: [AuthService, JwtModule ,   UserRepository,   
    AgencyRepository ], 
})
export class AuthModule {}