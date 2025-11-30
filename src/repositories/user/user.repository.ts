import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { IUserDomainRepository , CreateUserData  , UpdateUserFields } from '../../modules/users/domain/repositories/user.repository.interface';
import { User } from '../../modules/users/domain/entities/user.entity';
import { NavbarUser } from '../../modules/users/domain/value-objects/navbar-user.vo';
import { hashPassword } from '../../common/utils/hash';

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
        profile_img: true,
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
        profile_img: true,
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
        profile_img: true,
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

  async create(data: CreateUserData): Promise<number> {
    const hashedPassword = await hashPassword(data.password);
    const result = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        status: data.status as any,
        email_verified: false,
      },
    });
    return result.id;
  }

  async updateFields(userId: number, fields: Partial<UpdateUserFields>): Promise<void> {
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([_, val]) => val !== undefined),
    ) as Partial<UpdateUserFields>;

    if (Object.keys(filtered).length === 0) return;

    (filtered as any).updated_at = new Date();
    await this.prisma.user.update({ where: { id: userId }, data: filtered });
  }

  async updateUsername(userId: number, newUsername: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername, updated_at: new Date() },
    });
  }

  async updateProfileImage(userId: number, imageUrl: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { profile_img: imageUrl, updated_at: new Date() },
    });
  }

  async deleteProfileImage(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { profile_img: null, updated_at: new Date() },
    });
  }

  async verifyEmail(userId: number, emailVerified: boolean, status: string): Promise<void> {
    await this.prisma.user.update({
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
        profile_img: true,
        last_login: true,
        role: true,
      },
    });

    return user
      ? new NavbarUser(user.username, user.email, user.profile_img, user.last_login, user.role)
      : null;
  }
}

// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../../infrastructure/prisma/prisma.service';
// import { hashPassword } from '../../common/utils/hash';
// import type { IUserRepository } from './Iuser.repository';
// // import type { NewUser, PartialUserByToken } from '../../types/database.js';
// import type { BaseUserInfo, NavbarUser } from '../../modules/users/types/base-user-info';
// import { UserCreationData } from '../../modules/auth/types/create-user-input';
// import type { UpdatableUserFields } from '../../modules/users/types/update-user-info'
// import { PartialUserForLogin ,PartialUserByToken } from '../../common/types/user';

// import { user_status } from '@prisma/client';
// @Injectable()
// export class UserRepository implements IUserRepository {
//   constructor(private readonly prisma: PrismaService) {}

//   // CREATE
//   async create(userData:UserCreationData): Promise<number> {
//     const hashedPassword = await hashPassword(userData.password);
//     const result = await this.prisma.user.create({
//       data: {
//         ...userData,
//         password: hashedPassword,
//         email_verified: false,
//       },
//     });
//     return result.id;
//   }

//   // READ
//    findByIdWithPassword(userId: number): Promise<{ id: number; password: string } | null> {
//     return this.prisma.user.findUnique({
//       where: { id: userId },
//       select: { id: true, password: true },
//     });
//   }

//   async findById(userId: number): Promise<BaseUserInfo | null> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true, email: true, username: true, role: true, first_name: true, last_name: true,
//         about_me: true, profile_img: true, phone: true, website: true, status: true,
//         last_login: true, last_active: true, created_at: true, updated_at: true,
//       },
//     });
//     return user ? (user as BaseUserInfo) : null;
//   }
//  getNavbarUser(userId: number):Promise<NavbarUser | null> {
//   return this.prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       username: true,
//       email: true,
//       profile_img: true,
//       last_login: true,
//       role:true,
//     },
//   });
// }
//   async findByIdentifier(identifier: string): Promise<PartialUserForLogin | null> {
//     return this.prisma.user.findFirst({
//       where: { OR: [{ username: identifier }, { email: identifier }] },
//       select: { id: true, username: true, email: true, password: true, status: true, role: true, email_verified: true, first_name: true },
//     });
//   }

//   // async findByVerificationToken(token: string): Promise<PartialUserByToken | null> {
//   //   return this.prisma.user.findFirst({
//   //     where: { verification_token: token, verification_token_expires: { gt: new Date() } },
//   //     select: { id: true, role: true, email: true, username: true, first_name: true, last_name: true },
//   //   });
//   // }

//    async findByIdForProfileImage(userId: number): Promise<{ id: number; profile_img: string | null } | null> {
//     return  this.prisma.user.findUnique({
//       where: { id: userId },
//       select: { id: true, profile_img: true },
//     });
//   }
// async updateProfileImage(userId: number, imageUrl: string): Promise<void> {
//   await this.prisma.user.update({
//     where: { id: userId },
//     data: {
//       profile_img: imageUrl,
//       updated_at: new Date(),
//     },
//   });
// }
//   async getUsernameById(userId: number): Promise<string | null> {
//     const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
//     return user?.username ?? null;
//   }

//   async getUserPasswordById(userId: number): Promise<string | null> {
//     const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
//     return user?.password ?? null;
//   }

//   async emailExists(email: string): Promise<boolean> {
//     const user = await this.prisma.user.findFirst({ where: { email }, select: { id: true } });
//     return !!user;
//   }

//   async usernameExists(username: string): Promise<boolean> {
//     const user = await this.prisma.user.findFirst({ where: { username }, select: { username: true } });
//     return !!user;
//   }

//   async findByEmail(email: string): Promise<{ id: number; email: string; first_name: string | null; email_verified: boolean; status: user_status } | null> {
//     const user = await this.prisma.user.findUnique({
//       where: { email },
//       select: { id: true, email: true, first_name: true, email_verified: true, status: true },
//     });
//     return user ?? null;
//   }

//   // UPDATE
//   async updateFieldsById(userId: number, fields: Partial<UpdatableUserFields>): Promise<void> {
//     const filtered = Object.fromEntries(Object.entries(fields).filter(([_, val]) => val !== undefined)) as Partial<UpdatableUserFields>;
//     if (Object.keys(filtered).length === 0) return;
//     (filtered as any).updated_at = new Date();
//     await this.prisma.user.update({ where: { id: userId }, data: filtered });
//   }

//   async verifyEmail(userId: number, emailVerified: boolean, statusToUpdate: user_status): Promise<void> {
//     await this.prisma.user.update({
//       where: { id: userId },
//       data: { email_verified: emailVerified, status: statusToUpdate,  updated_at: new Date() },
//     });
//   }

//   // async regenerateVerificationToken(userId: number, token: string, expires: Date): Promise<void> {
//   //   await this.prisma.user.update({
//   //     where: { id: userId },
//   //     data: { verification_token: token, verification_token_expires: expires, updated_at: new Date() },
//   //   });
//   // }
//   async deleteImage(userId:number){
//     await this.prisma.user.update({
//   where: { id: userId },
//   data: { profile_img: null },
// });

//   }
//   async findUnverifiedBefore(date: Date) {
//     return this.prisma.user.findMany({
//       where: { email_verified: false, created_at: { lt: date } },
//       select: { id: true },
//     });
//   }

//   async deleteById(userId: number) {
//     return this.prisma.user.delete({ where: { id: userId } });
//   }
// }
