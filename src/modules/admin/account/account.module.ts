import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AdminAuthModule } from "../auth/admin-auth.module";

@Module({
  controllers:[AccountController],  
  imports:[AdminAuthModule]
})

export class AccountModule{}