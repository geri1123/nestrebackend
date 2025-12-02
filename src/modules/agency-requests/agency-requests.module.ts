import { Module } from "@nestjs/common";
import { RegistrationRequestModule } from "../registration-request/registration-request.module";
import { AgencyRequestsController } from "./controller/agency-requests.controller";
import { AgentModule } from "../agent/agent.module";
import { UsersModule } from "../users/users.module";
import { AgencyModule } from "../agency/agency.module";
import { GetAgencyRequestsUseCase } from "./application/use-cases/get-agency-requests.use-case";
import { ApproveAgencyRequestUseCase } from "./application/use-cases/approve-agency-request.use-case";
import { RejectAgencyRequestUseCase } from "./application/use-cases/reject-agency-request.use-case";
import { UpdateAgencyRequestStatusUseCase } from "./application/use-cases/update-agency-request-status.use-case";
import { EmailModule } from "../../infrastructure/email/email.module";

@Module({
  imports: [
    AgencyModule,
    RegistrationRequestModule,
    AgentModule,
    UsersModule,
    EmailModule
  ],
  controllers: [AgencyRequestsController],
  providers: [
    GetAgencyRequestsUseCase,
    ApproveAgencyRequestUseCase,
    RejectAgencyRequestUseCase,
    UpdateAgencyRequestStatusUseCase,
  ],
  exports: [
    GetAgencyRequestsUseCase,
    ApproveAgencyRequestUseCase,
    RejectAgencyRequestUseCase,
    UpdateAgencyRequestStatusUseCase,
  ],
})
export class AgencyRequestsModule {}