import { Module } from "@nestjs/common";
import { UsersModule } from "../../users/users.module";
import { AdminUserController } from "./admin-user.controller";
import { GetAllUsersAdminUseCase } from "./application/get-all-users.use-case";
import { AdminAuthModule } from "../auth/admin-auth.module";
import { ChangeUserStatusUseCase } from "./application/change-user-status.use-case";

@Module({
   imports:[UsersModule , AdminAuthModule],
   controllers:[
    AdminUserController,
    
   ],
   providers:[GetAllUsersAdminUseCase , ChangeUserStatusUseCase]
})
export class AdminUserModule{};