import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AgencyModule } from "../agency/agency.module";
import { RegistrationRequestModule } from "../registration-request/registration-request.module";
import { DeleteUserUseCase } from "./application/use-cases/delete-unverified-user.use-case";
import { CleanupService } from "./service/clean-up.service";
import { AdvertiseProductModule } from "../advertise-product/advertise-product.module";
import { DeleteUserByIdUseCase } from "./application/use-cases/delete-user.use-case";
import { ProductModule } from "../product/product.module";
import { AgentRepository } from "../agent/infrastructure/persistence/agent.repository";
import { AgentModule } from "../agent/agent.module";
import { CleanupController } from "./cleanup.controller";
import { ReviewModule } from "../review/review.module";
import { AuthContextModule } from "../../infrastructure/auth/modules/auth-context.module";
import { AuthModule } from "../auth/auth.module";
import { SaveProductModule } from "../saved-product/save-product.module";
@Module({
  imports: [
    UsersModule,
    AgencyModule,
    AgentModule,
    RegistrationRequestModule,
    AdvertiseProductModule,
    ProductModule,
    ReviewModule,
    AuthContextModule,
    AuthModule,
    SaveProductModule,
  ],
  controllers: [  CleanupController],
  providers: [DeleteUserByIdUseCase , CleanupService , DeleteUserUseCase],
  exports: [DeleteUserUseCase , CleanupService],
})
export class CleanupModule {}