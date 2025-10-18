import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AgentsRepository } from './agent.repository';
@Module({
  imports: [PrismaModule],
  providers: [AgentsRepository],
  exports: [AgentsRepository],
})
export class AgentRepositoryModule {}