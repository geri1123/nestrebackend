import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // ✅ Add this import
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ Add this if using ConfigService
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepositoryModule } from '../repositories/user/users.repository.module';
import { AgencyRepositoryModule } from '../repositories/agency/agency.repository.module';
import { AgentRepositoryModule } from '../repositories/agent/agent.repository.module';
import { PasswordController } from './password.controller';
import { EmailModule } from '../email/email.module';
import { PasswordRecoveryService } from './password.service';
import { RegistrationRequestRepositoryModule } from '../repositories/registration-request/registration-request.module';
import { PasswordResetTokenRepositoryModule } from '../repositories/passwordReset/password-reset.module';

@Module({
  imports: [
    UsersRepositoryModule,
    AgencyRepositoryModule,
    AgentRepositoryModule,
    RegistrationRequestRepositoryModule,
    PasswordResetTokenRepositoryModule,
    EmailModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: {
          expiresIn: '1d', 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, PasswordRecoveryService],
  controllers: [AuthController, PasswordController],
  exports: [AuthService, JwtModule], 
})
export class AuthModule {}