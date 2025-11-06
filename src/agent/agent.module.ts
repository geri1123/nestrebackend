import { Module } from '@nestjs/common';
import { AgentsRepository } from '../repositories/agent/agent.repository';
import { AgentService } from './agent.service';

import { AgentPermissionRepository } from '../repositories/agent-permision/agent-permision.repository';
import { AgentPermisionService } from './agent-permision.service';


@Module({
  imports: [],
  providers: [AgentService,AgentsRepository ,AgentPermisionService, AgentPermissionRepository],
  exports: [AgentsRepository , AgentService , AgentPermisionService],
})
export class AgentModule {}