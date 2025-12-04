import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AgencyModule } from '../agency/agency.module';
import { RegistrationRequestModule } from '../registration-request/registration-request.module';
import { EmailModule } from '../../infrastructure/email/email.module';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { RegisterAgencyOwnerUseCase } from './application/use-cases/register-agency-owner.use-case';
import { RegisterAgentUseCase } from './application/use-cases/register-agent.use-case';
import { AgentModule } from '../agent/agent.module';
import { ValidateAgentRegistrationDataUseCase } from './application/use-cases/validate-agent-registration-data.use-case';

@Module({
  imports: [
    UsersModule,
    AgencyModule,
    RegistrationRequestModule,
    EmailModule,
    AppCacheModule,
    AgentModule
  ],
  providers: [
    RegisterUserUseCase,
    RegisterAgencyOwnerUseCase,
    RegisterAgentUseCase,
    ValidateAgentRegistrationDataUseCase,
  ],
  exports: [
    RegisterUserUseCase,
    RegisterAgencyOwnerUseCase,
    RegisterAgentUseCase,
  ]
})
export class RegistrationModule {}