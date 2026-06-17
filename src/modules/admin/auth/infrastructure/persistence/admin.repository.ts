import { AdminRole } from "@prisma/client";
import { PrismaService } from "../../../../../infrastructure/prisma/prisma.service";
import { AdminUserDomainEntity } from "../../domain/entities/admin-user.entity";
import { CreateAdmin, IAdminRepository } from "../../domain/repositories/admin.repository.interface";
import { Injectable } from "@nestjs/common";
@Injectable()
export class AdminRepository implements IAdminRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async findAdminByEmail(email: string): Promise<AdminUserDomainEntity | null> {
        const adminUser = await this.prismaService.adminUser.findUnique({
            where: { email },
        });
        return adminUser ? AdminUserDomainEntity.fromPrisma(adminUser) : null;
    }
    async findAdminById(id: number): Promise<AdminUserDomainEntity | null> {
        const adminUser = await this.prismaService.adminUser.findUnique({
            where: { id },
        });
        return adminUser ? AdminUserDomainEntity.fromPrisma(adminUser) : null;
    }
   async createAdmin(data: CreateAdmin): Promise<void> {
  await this.prismaService.adminUser.create({
    data: {
      email:    data.email,
      name:     data.name,
      password: data.password,
      role:     data.role, 
    },
  });
}
}