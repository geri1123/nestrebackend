import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AgencyModule } from "../agency/agency.module";
import { RegistrationRequestModule } from "../registration-request/registration-request.module";
import { DeleteUserUseCase } from "./application/use-cases/delete-user.use-case";
import { UserCleanupService } from "./service/user-clean-up.service";
@Module({
  imports: [
    UsersModule,
    AgencyModule,
    RegistrationRequestModule,
  ],
  providers: [DeleteUserUseCase , UserCleanupService],
  exports: [DeleteUserUseCase],
})
export class CleanupModule {}