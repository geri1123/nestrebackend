import { Global, Module } from '@nestjs/common';
import { AgentModule } from '../../../modules/agent/agent.module';
import { AgencyModule } from '../../../modules/agency/agency.module';
import { AgentContextService } from '../services/agent-context.service';
import { AgencyOwnerContextService } from '../services/agency-owner-context.service';
import { AgencyContextOrchestrator } from '../services/agency-context-orchestrator.service';
import { AGENT_PROFILE_PORT } from '../../../modules/agent/application/ports/agent-profile.port';
import { AGENCY_OWNER_PROFILE_PORT } from '../../../modules/agency/application/ports/agency-owner-profile.port';
 
@Global()
@Module({
  imports: [AgentModule, AgencyModule],
  providers: [
    AgentContextService,
    AgencyOwnerContextService,
    AgencyContextOrchestrator,
    {
      provide: AGENT_PROFILE_PORT,
      useExisting: AgentContextService,
    },
    {
      provide: AGENCY_OWNER_PROFILE_PORT,
      useExisting: AgencyOwnerContextService,
    },
  ],
  exports: [
    AgentContextService,
    AgencyOwnerContextService,
    AgencyContextOrchestrator,
    AGENT_PROFILE_PORT,
    AGENCY_OWNER_PROFILE_PORT,
  ],
})
export class AgencyContextModule {}
 