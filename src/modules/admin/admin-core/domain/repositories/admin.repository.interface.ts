import { AdminRole } from "@prisma/client";
import { AdminUserDomainEntity } from "../entities/admin-user.entity";
export interface CreateAdmin {
    email:string;
    name:string;
    password:string;
    role:AdminRole;
}
  export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<AdminUserDomainEntity | null>;
    findAdminById(id: number): Promise<AdminUserDomainEntity | null>;
    createAdmin(data: CreateAdmin): Promise<AdminUserDomainEntity>
  }