import { Module } from '@nestjs/common';
import { AgentController } from './controllers/agent-controller';
import { AgentRepository } from './infrastructure/persistence/agent.repository';
import { AgentPermissionRepository } from './infrastructure/persistence/agent-permision.repository';
import { GetAgentsUseCase } from './application/use-cases/get-agents.use-case';
import { UpdateAgentUseCase } from './application/use-cases/update-agent.use-case';
import { NotificationModule } from '../notification/notification.module';
import { AGENT_REPOSITORY_TOKENS } from './domain/repositories/agent.repository.tokens';
import { GetSingleAgentInAgencyUseCase } from './application/use-cases/find-agent-in-agency.use-case';
import { GetAgencyIdForAgentUseCase } from './application/use-cases/get-agency-id-for-agent.use-case';
import { GetAgentByIdUseCase } from './application/use-cases/get-agent-by-id.use-case';
import { FindExistingAgentUseCase } from './application/use-cases/find-existing-agent.use-case';
import { AddAgentPermissionsUseCase } from './application/use-cases/add-agenct-permissons.use-case';
import { EnsureIdCardUniqueUseCase } from './application/use-cases/ensure-idcard-unique.use-case';
import { CreateAgentUseCase } from './application/use-cases/create-agent.use-case';
import { GetAgentPermissionsUseCase } from './application/use-cases/get-agent-permission.use-case';
import { UpdateAgentPermissionsUseCase } from './application/use-cases/update-agent-permissions.use-case';
import { GetAgentAuthContextUseCase } from './application/use-cases/get-agent-auth-context.use-case';
import { GetAgentMeUseCase } from './application/use-cases/get-agent-me.use-case';
import { GetAgentByIdInAgencyUseCase } from './application/use-cases/get-agent-in-agency.use-case';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { CountAgentsInAgencyUseCase } from './application/use-cases/count-agents-in-agency.use-case';

@Module({
  imports: [
    NotificationModule,
    PrismaModule,
    // REMOVED: AgencyModule (to break circular dependency)
  ],
  controllers: [AgentController],
  providers: [
    AgentRepository,
    GetAgencyIdForAgentUseCase,
    GetSingleAgentInAgencyUseCase,
    AgentPermissionRepository,
    GetAgentByIdUseCase,
    FindExistingAgentUseCase,
    AddAgentPermissionsUseCase,
    EnsureIdCardUniqueUseCase,
    CreateAgentUseCase,
    GetAgentAuthContextUseCase,
    UpdateAgentPermissionsUseCase,
    GetAgentPermissionsUseCase,
    GetAgentMeUseCase,
    GetAgentByIdInAgencyUseCase,
    CountAgentsInAgencyUseCase,
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
    GetAgentAuthContextUseCase,
    GetSingleAgentInAgencyUseCase,
    GetAgentsUseCase,
    UpdateAgentUseCase,
    GetAgencyIdForAgentUseCase,
    GetAgentByIdUseCase,
    EnsureIdCardUniqueUseCase,
    FindExistingAgentUseCase,
    AddAgentPermissionsUseCase,
    CreateAgentUseCase,
    CountAgentsInAgencyUseCase
  ],
})
export class AgentModule {}