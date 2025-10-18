import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../utils/hash.js';
import type { IUserRepository } from './Iuser.repository';
// import type { NewUser, PartialUserByToken } from '../../types/database.js';
import type { BaseUserInfo } from '../../users/types/base-user-info';
import { UserCreationData } from '../../auth/types/create-user-input';
import type { UpdatableUserFields } from '../../users/types/update-user-info'
import { PartialUserForLogin ,PartialUserByToken } from '../../types/user';
// import { user_status } from '@prisma/client';
import { user_status } from '@prisma/client';
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE
  async create(userData:UserCreationData): Promise<number> {
    const hashedPassword = await hashPassword(userData.password);
    const result = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        email_verified: false,
      },
    });
    return result.id;
  }

  // READ
  async findByIdWithPassword(userId: number): Promise<{ id: number; password: string } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });
  }

  async findById(userId: number): Promise<BaseUserInfo | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, username: true, role: true, first_name: true, last_name: true,
        about_me: true, profile_img: true, phone: true, website: true, status: true,
        last_login: true, last_active: true, created_at: true, updated_at: true,
      },
    });
    return user ? (user as BaseUserInfo) : null;
  }

  async findByIdentifier(identifier: string): Promise<PartialUserForLogin | null> {
    return this.prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
      select: { id: true, username: true, email: true, password: true, status: true, role: true, email_verified: true, first_name: true },
    });
  }

  async findByVerificationToken(token: string): Promise<PartialUserByToken | null> {
    return this.prisma.user.findFirst({
      where: { verification_token: token, verification_token_expires: { gt: new Date() } },
      select: { id: true, role: true, email: true, username: true, first_name: true, last_name: true },
    });
  }

  async findByIdForProfileImage(userId: number): Promise<{ id: number; profile_img: string | null } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, profile_img: true },
    });
  }

  async getUsernameById(userId: number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
    return user?.username ?? null;
  }

  async getUserPasswordById(userId: number): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    return user?.password ?? null;
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { email }, select: { id: true } });
    return !!user;
  }

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where: { username }, select: { username: true } });
    return !!user;
  }

  async findByEmail(email: string): Promise<{ id: number; email: string; first_name: string | null; email_verified: boolean; status: user_status } | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, first_name: true, email_verified: true, status: true },
    });
    return user ?? null;
  }

  // UPDATE
  async updateFieldsById(userId: number, fields: Partial<UpdatableUserFields>): Promise<void> {
    const filtered = Object.fromEntries(Object.entries(fields).filter(([_, val]) => val !== undefined)) as Partial<UpdatableUserFields>;
    if (Object.keys(filtered).length === 0) return;
    (filtered as any).updated_at = new Date();
    await this.prisma.user.update({ where: { id: userId }, data: filtered });
  }

  async verifyEmail(userId: number, emailVerified: boolean, statusToUpdate: user_status): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { email_verified: emailVerified, status: statusToUpdate, verification_token: null, verification_token_expires: null, updated_at: new Date() },
    });
  }

  async regenerateVerificationToken(userId: number, token: string, expires: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { verification_token: token, verification_token_expires: expires, updated_at: new Date() },
    });
  }
}
