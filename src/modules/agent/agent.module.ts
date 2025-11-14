import { Module } from '@nestjs/common';
import { AgentsRepository } from '../../repositories/agent/agent.repository';
import { AgentService } from './agent.service';

import { AgentPermissionRepository } from '../../repositories/agent-permision/agent-permision.repository';
import { AgentPermisionService } from './agent-permision.service';
import { AgencyModule } from '../agency/agency.module';
import { AgentController } from './agent-controller';
import { ManageAgentsService } from './manage-agents.service';


@Module({
  imports: [AgencyModule],
    controllers: [AgentController],
  providers: [AgentService,AgentsRepository ,AgentPermisionService, AgentPermissionRepository , ManageAgentsService],
  exports: [AgentsRepository , AgentService , AgentPermisionService],
})
export class AgentModule {}