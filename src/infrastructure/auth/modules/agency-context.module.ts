import { Global, Module } from '@nestjs/common';
import { AgencyContextService } from '../services/agency-context.service';
import { AgentModule } from '../../../modules/agent/agent.module';
import { AgencyModule } from '../../../modules/agency/agency.module';
@Global()
@Module({
  imports: [AgentModule, AgencyModule],
  providers: [AgencyContextService],
  exports: [AgencyContextService],
})
export class AgencyContextModule {}