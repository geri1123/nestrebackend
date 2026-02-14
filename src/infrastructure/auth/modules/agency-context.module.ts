import { Global, Module } from '@nestjs/common';
import { AgentModule } from '../../../modules/agent/agent.module';
import { AgencyModule } from '../../../modules/agency/agency.module';
import { AgentContextService } from '../services/agent-context.service';
import { AgencyOwnerContextService } from '../services/agency-owner-context.service';
import { AgencyContextOrchestrator } from '../services/agency-context-orchestrator.service';
@Global()
@Module({
 imports: [AgentModule, AgencyModule],
  providers: [
    AgentContextService,
    AgencyOwnerContextService,
    AgencyContextOrchestrator,
  ],
  exports: [
    AgentContextService,
    AgencyOwnerContextService,
    AgencyContextOrchestrator,
  ],
})
export class AgencyContextModule {}