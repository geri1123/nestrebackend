import { Module } from "@nestjs/common";
import { RegistrationRequestRepository } from "./infrasctructure/persistence/registration-request.repository";
import { AgencyModule } from "../agency/agency.module";
import { AgentModule } from "../agent/agent.module";
import { NotificationModule } from "../notification/notification.module";
import { CheckAgentDataUseCase } from "./application/use-cases/check-agent-data.use-case";
import { CreateAgentRequestUseCase } from "./application/use-cases/create-agent-request.use-case";
import { GetRequestsUseCase } from "./application/use-cases/get-request.use-case";
import { SendQuickRequestUseCase } from "./application/use-cases/send-quick-request.use-case";
import { SetUnderReviewUseCase } from "./application/use-cases/set-under-review.use-case";
import { UpdateRequestStatusUseCase } from "./application/use-cases/update-request-status.use-case";
import { REG_REQ_TOKEN } from "./domain/repositories/reg-req.repository.token";
import { RegistrationRequestController } from "./registration-request.controller";
import { FindRequestByIdUseCase } from "./application/use-cases/find-req-by-id.use-case";
import { DeleteRegistrationRequestsByUserUseCase } from "./application/use-cases/delete-requests-by-user.use-case";
import { FindRequestsByUserIdUseCase } from "./application/use-cases/find-requests-by-user-id.use-case";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GetRequestCountUseCase } from "./application/use-cases/get-request-count.use-case";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [NotificationModule, AgencyModule, AgentModule ,UsersModule],
  controllers: [RegistrationRequestController],
  providers: [
    {
      provide: REG_REQ_TOKEN.REG_REQ_REPOSITORY,
      useClass: RegistrationRequestRepository,
    },
PrismaService,
DeleteRegistrationRequestsByUserUseCase,

    CreateAgentRequestUseCase,
    CheckAgentDataUseCase,
    GetRequestsUseCase,
    GetRequestCountUseCase,
    SetUnderReviewUseCase,
    UpdateRequestStatusUseCase,
    SendQuickRequestUseCase,
    FindRequestByIdUseCase,
    FindRequestsByUserIdUseCase
  ],
  exports: [
    CreateAgentRequestUseCase,
    CheckAgentDataUseCase,
    SendQuickRequestUseCase,
    FindRequestByIdUseCase,
    DeleteRegistrationRequestsByUserUseCase,
    FindRequestsByUserIdUseCase,
    GetRequestCountUseCase,
    SetUnderReviewUseCase,
     GetRequestsUseCase,  
     UpdateRequestStatusUseCase,
     
      REG_REQ_TOKEN.REG_REQ_REPOSITORY,
  ]
})
export class RegistrationRequestModule {}

