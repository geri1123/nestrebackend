import { Module } from "@nestjs/common";
import { AdminAgenciesController } from "./agencies-admin.controller";
import { GetAllAgenciesAdminUseCase } from "./application/get-agencies.use-case";
import { AgencyModule } from "../../agency/agency.module";
import { AdminJwtGuard } from "../auth/guard/admin-jwt.guard";
import { AdminModule } from "../admin.module";
import { AdminAuthModule } from "../auth/admin-auth.module";



@Module({
    imports:[AgencyModule , AdminAuthModule ],
    controllers: [
  
  AdminAgenciesController,  
],
providers: [
  GetAllAgenciesAdminUseCase, 
],
})
export class AgenciesAdminModule{};