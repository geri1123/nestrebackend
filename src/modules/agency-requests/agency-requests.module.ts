import { Module } from "@nestjs/common";
import { RegistrationRequestModule } from "../registration-request/registration-request.module";

import { AgencyRequestsService } from "./agency-requests.service";
import { AgencyRequestsController } from "./agency-requests.controller";
import { AgentModule } from "../agent/agent.module";
import { UsersModule } from "../users/users.module";
import { AgencyModule } from "../agency/agency.module";

@Module({
        imports: [AgencyModule,RegistrationRequestModule ,AgentModule ,UsersModule],
            controllers: [AgencyRequestsController],
        providers: [AgencyRequestsService],
        exports: [AgencyRequestsService],
})
export class AgencyRequestsModule {}