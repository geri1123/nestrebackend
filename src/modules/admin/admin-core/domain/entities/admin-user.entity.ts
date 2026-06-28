import { comparePassword } from "../../../../../common/utils/hash";

import { AdminUser } from '@prisma/client';

export class AdminUserDomainEntity {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name:string ,
   private readonly password: string,
    public readonly role: 'admin' | 'super_admin',
    public readonly createdAt: Date,
    public readonly updatedAt: Date | null,
  ) {}

  static fromPrisma(prismaEntity: AdminUser): AdminUserDomainEntity {
    return new AdminUserDomainEntity(
      prismaEntity.id,
      prismaEntity.email,
      prismaEntity.name,
      prismaEntity.password,
      prismaEntity.role,
      prismaEntity.createdAt,
      prismaEntity.updatedAt,
    );
  }
    async verifyPassword(plainPassword: string): Promise<boolean> {
    return comparePassword(plainPassword, this.password);
  }
}
