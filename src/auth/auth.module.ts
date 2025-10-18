import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegistrationService } from './registration.service';
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
EmailModule
  ],
  providers: [RegistrationService , PasswordRecoveryService],
  controllers: [AuthController , PasswordController],
})
export class AuthModule {}