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
import { PrismaModule } from "../../infrastructure/prisma/prisma.module";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GetRequestCountUseCase } from "./application/use-cases/get-request-count.use-case";
import { CheckIdCardUniqueForRegistrationUseCase } from "./application/use-cases/check-id-card-unique.use-case";

@Module({
  imports: [NotificationModule, AgencyModule, AgentModule ],
  controllers: [RegistrationRequestController],
  providers: [
    {
      provide: REG_REQ_TOKEN.REG_REQ_REPOSITORY,
      useClass: RegistrationRequestRepository,
    },
PrismaService,
DeleteRegistrationRequestsByUserUseCase,
CheckIdCardUniqueForRegistrationUseCase,
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
     CheckIdCardUniqueForRegistrationUseCase,
      REG_REQ_TOKEN.REG_REQ_REPOSITORY,
  ]
})
export class RegistrationRequestModule {}

// import { Module } from '@nestjs/common';
// import { RegistrationRequestService } from './registration-request.service';
// import { NotificationModule } from '../notification/notification.module';
// import { RegistrationRequestRepository } from '../../repositories/registration-request/registration-request.repository';
// import { AgencyModule } from '../agency/agency.module';
// import { AgentModule } from '../agent/agent.module';
// import { RegistrationRequestController } from './registration-request.controller';
// import { REG_REQ_TOKEN } from './domain/repositories/reg-req.repository.token';

// @Module({
//   imports: [NotificationModule , AgencyModule , AgentModule], 
//   controllers:[RegistrationRequestController],
//   providers: [
//       { provide: REG_REQ_TOKEN.REG_REQ_REPOSITORY, useClass: RegistrationRequestRepository },
//     RegistrationRequestService,
//     RegistrationRequestRepository,
//   ],
//   exports: [
//     RegistrationRequestService, RegistrationRequestRepository
//   ],
// })
// export class RegistrationRequestModule {}



