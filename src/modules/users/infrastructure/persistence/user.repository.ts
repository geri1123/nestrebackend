import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { IUserDomainRepository , CreateUserData  , UpdateUserFields } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { NavbarUser } from '../../domain/value-objects/navbar-user.vo';
import { hashPassword } from '../../../../common/utils/hash';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserDomainRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(userId: number): Promise<User | null> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      first_name: true,
      last_name: true,
      about_me: true,
      profile_img_url: true,
      profile_img_public_id: true,
      phone: true,
      status: true,
      email_verified: true,
      last_login: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user ? User.create(user as any) : null;
}


  async findByIdentifier(identifier: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        status: true,
        role: true,
        email_verified: true,
        first_name: true,
        last_name: true,
        about_me: true,
          profile_img_url: true,
      profile_img_public_id: true,
        phone: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user ? User.create(user as any) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        email_verified: true,
        status: true,
        role: true,
        about_me: true,
       profile_img_url: true,
      profile_img_public_id: true,
        phone: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user ? User.create(user as any) : null;
  }

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { username },
      select: { username: true },
    });
    return !!user;
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async create(
    data: CreateUserData,
   tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx ?? this.prisma;
    const hashedPassword = await hashPassword(data.password);
    const result = await client.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        status: data.status as any,
        email_verified: data.email_verified ?? false,
      google_user: data.google_user ?? false,     
      google_id: data.google_id ?? null,  
        
      },
    });
    return result.id;
  }
async updateFields(
  userId: number,
  fields: Partial<UpdateUserFields>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? this.prisma;

  const filtered = Object.fromEntries(
    Object.entries(fields).filter(([_, val]) => val !== undefined),
  );

  if (Object.keys(filtered).length === 0) return;

  filtered.updated_at = new Date();

  await client.user.update({
    where: { id: userId },
    data: filtered,
  });
}
  // async updateFields(userId: number, fields: Partial<UpdateUserFields>): Promise<void> {
  //   const filtered = Object.fromEntries(
  //     Object.entries(fields).filter(([_, val]) => val !== undefined),
  //   ) as Partial<UpdateUserFields>;

  //   if (Object.keys(filtered).length === 0) return;

  //   (filtered as any).updated_at = new Date();
  //   await this.prisma.user.update({ where: { id: userId }, data: filtered });
  // }

  async updateUsername(userId: number, newUsername: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername, updated_at: new Date() },
    });
  }

  async updateProfileImage(
  userId: number,
  imageUrl: string,
  publicId: string,
): Promise<void> {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      profile_img_url: imageUrl,
      profile_img_public_id: publicId,
      updated_at: new Date(),
    },
  });
}

async deleteProfileImage(userId: number): Promise<void> {
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      profile_img_url: null,
      profile_img_public_id: null,
      updated_at: new Date(),
    },
  });
}
  async verifyEmail(userId: number, emailVerified: boolean, status: string , tx?:Prisma.TransactionClient): Promise<void> {
    const client =tx ?? this.prisma;
    await client.user.update({
      where: { id: userId },
      data: { email_verified: emailVerified, status: status as any, updated_at: new Date() },
    });
  }

async getNavbarUser(userId: number): Promise<NavbarUser | null> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      profile_img_url: true,
      last_login: true,
      role: true,
    },
  });

  return user
    ? new NavbarUser(
        user.username,
        user.email,
        user.profile_img_url,
        user.last_login,
        user.role,
      )
    : null;
}
    async findUnverifiedBefore(date: Date) {
    return this.prisma.user.findMany({
      where: { email_verified: false, created_at: { lt: date } },
      select: { id: true },
    });
  }
async deleteById(userId: number): Promise<void> {
  await this.prisma.user.delete({ where: { id: userId } });
}
async findByIdentifierForAuth(identifier: string) {
  return this.prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }]
    },
    select: {
      id: true,
      password: true,
      status: true,
      role: true,
      username: true,
      email: true,
      email_verified: true,
    }
  });
};
async findByIdWithPassword(userId: number) {
  return this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      password: true,
    },
  });
};
async updatePassword(userId: number, newPassword: string): Promise<void> {
  const hashed = await hashPassword(newPassword);

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      password: hashed,
      updated_at: new Date(),
    },
  });
};
async findByIdentifierForVerification(identifier: string) {
  return this.prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    select: {
      id: true,
      email: true,
      first_name: true,
      role: true,
      status: true,
      email_verified: true,
    },
  });
}
}
