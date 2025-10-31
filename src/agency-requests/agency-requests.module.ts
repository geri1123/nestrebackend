import { Module } from "@nestjs/common";
import { RegistrationRequestModule } from "../registration-request/registration.request.module";

import { AgencyRequestsService } from "./agency-requests.service";
import { AgencyRequestsController } from "./agency-requests.controller";

@Module({
        imports: [RegistrationRequestModule],
            controllers: [AgencyRequestsController],
        providers: [AgencyRequestsService],
        exports: [AgencyRequestsService],
})
export class AgencyRequestsModule {}