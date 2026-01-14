import { Module } from '@nestjs/common';
import { SharedAuthModule } from './shared-auth.module';
import { UsersModule } from '../../../modules/users/users.module';
import { AgentModule } from '../../../modules/agent/agent.module';
import { AgencyModule } from '../../../modules/agency/agency.module';
import { AuthContextService } from '../services/auth-context.service';

@Module({
  imports: [
    SharedAuthModule,
    UsersModule,
    AgentModule,
    AgencyModule,
  ],
  providers: [AuthContextService],
  exports: [AuthContextService],
})
export class AuthContextModule {}