import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent-controller';
import { AgentRepository } from '../../repositories/agent/agent.repository';
import { AgentPermissionRepository } from '../../repositories/agent-permision/agent-permision.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { FirebaseService } from '../../infrastructure/firebase/firebase.service';
import { GetAgentsUseCase } from './application/use-cases/get-agents.use-case';
import { UpdateAgentUseCase } from './application/use-cases/update-agent.use-case';
import { AgencyModule } from '../agency/agency.module';
import { NotificationModule } from '../notification/notification.module';
import { AGENT_REPOSITORY_TOKENS } from './domain/repositories/agent.repository.tokens';
import { FindAgentInAgencyUseCase } from './application/use-cases/find-agent-in-agency.use-case';
import { GetAgencyIdForAgentUseCase } from './application/use-cases/get-agency-id-for-agent.use-case';
import { GetAgentByIdUseCase } from './application/use-cases/get-agent-by-id.use-case';
import { FindExistingAgentUseCase } from './application/use-cases/find-existing-agent.use-case';
import { AddAgentPermissionsUseCase } from './application/use-cases/add-agenct-permissons.use-case';
@Module({
  imports: [AgencyModule, NotificationModule],
  controllers: [AgentController],
  providers: [
    PrismaService,
    FirebaseService,
    AgentRepository,
    GetAgencyIdForAgentUseCase,
    FindAgentInAgencyUseCase,
    AgentPermissionRepository,
    GetAgentByIdUseCase,
    FindExistingAgentUseCase,
    AddAgentPermissionsUseCase,
   {
      provide: AGENT_REPOSITORY_TOKENS.AGENT_REPOSITORY,
      useClass: AgentRepository,
    },
    {
      provide: AGENT_REPOSITORY_TOKENS.AGENT_PERMISSION_REPOSITORY,
      useClass: AgentPermissionRepository,
    },

    GetAgentsUseCase,
    UpdateAgentUseCase,
  ],
  exports: [
  FindAgentInAgencyUseCase,
    GetAgentsUseCase,
    UpdateAgentUseCase,
    GetAgencyIdForAgentUseCase,
    GetAgentByIdUseCase,
    FindExistingAgentUseCase,
    AddAgentPermissionsUseCase
  ],
})
export class AgentModule {}