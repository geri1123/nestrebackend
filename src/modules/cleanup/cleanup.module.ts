import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AgencyModule } from "../agency/agency.module";
import { RegistrationRequestModule } from "../registration-request/registration-request.module";
import { DeleteUserUseCase } from "./application/use-cases/delete-unverified-user.use-case";
import { CleanupService } from "./service/clean-up.service";
import { AdvertisementPricingModule } from "../advertisement-pricing/advertisement-prising.module";
import { AdvertiseProductModule } from "../advertise-product/advertise-product.module";
@Module({
  imports: [
    UsersModule,
    AgencyModule,
    RegistrationRequestModule,
    AdvertiseProductModule
  ],
  providers: [DeleteUserUseCase , CleanupService],
  exports: [DeleteUserUseCase , CleanupService],
})
export class CleanupModule {}