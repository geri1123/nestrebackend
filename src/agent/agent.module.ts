import { Module } from '@nestjs/common';
import { AgentsRepository } from '../repositories/agent/agent.repository';
import { AgentService } from './agent.service';




@Module({
  imports: [],
  providers: [AgentService,AgentsRepository],
  exports: [AgentsRepository , AgentService],
})
export class AgentModule {}