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
        firstName: true,
        lastName: true,
        aboutMe: true,
        profileImgUrl: true,
        profileImgPublicId: true,
        phone: true,
        status: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // Map camelCase to snake_case for entity
    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.firstName,
      last_name: user.lastName,
      about_me: user.aboutMe,
      profile_img_url: user.profileImgUrl,
      profile_img_public_id: user.profileImgPublicId,
      phone: user.phone,
      status: user.status,
      email_verified: user.emailVerified,
      last_login: user.lastLogin?.toISOString() ?? null,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt?.toISOString() ?? null,
    } as any);
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ username: identifier }, { email: identifier }] },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        aboutMe: true,
        profileImgUrl: true,
        profileImgPublicId: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // Map camelCase to snake_case for entity
    return User.create({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      email_verified: user.emailVerified,
      first_name: user.firstName,
      last_name: user.lastName,
      about_me: user.aboutMe,
      profile_img_url: user.profileImgUrl,
      profile_img_public_id: user.profileImgPublicId,
      phone: user.phone,
      last_login: user.lastLogin?.toISOString() ?? null,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt?.toISOString() ?? null,
    } as any);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        status: true,
        role: true,
        aboutMe: true,
        profileImgUrl: true,
        profileImgPublicId: true,
        phone: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    // Map camelCase to snake_case for entity
    return User.create({
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      email_verified: user.emailVerified,
      status: user.status,
      role: user.role,
      about_me: user.aboutMe,
      profile_img_url: user.profileImgUrl,
      profile_img_public_id: user.profileImgPublicId,
      phone: user.phone,
      last_login: user.lastLogin?.toISOString() ?? null,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt?.toISOString() ?? null,
    } as any);
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
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        status: data.status as any,
        emailVerified: data.email_verified ?? false,
        googleUser: data.google_user ?? false,     
        googleId: data.google_id ?? null,  
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

    // Map snake_case to camelCase for Prisma
    const prismaFields: any = {};
    
    if (fields.first_name !== undefined) prismaFields.firstName = fields.first_name;
    if (fields.last_name !== undefined) prismaFields.lastName = fields.last_name;
    if (fields.about_me !== undefined) prismaFields.aboutMe = fields.about_me;
    if (fields.phone !== undefined) prismaFields.phone = fields.phone;
    if (fields.password !== undefined) prismaFields.password = fields.password;
    if (fields.status !== undefined) prismaFields.status = fields.status;
    if (fields.role !== undefined) prismaFields.role = fields.role;
    if (fields.last_active !== undefined) prismaFields.lastActive = fields.last_active;
    if (fields.last_login !== undefined) prismaFields.lastLogin = fields.last_login;
    if (fields.profile_img !== undefined) prismaFields.profileImgUrl = fields.profile_img;

    if (Object.keys(prismaFields).length === 0) return;

    prismaFields.updatedAt = new Date();

    await client.user.update({
      where: { id: userId },
      data: prismaFields,
    });
  }

  async updateUsername(userId: number, newUsername: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername, updatedAt: new Date() },
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
        profileImgUrl: imageUrl,
        profileImgPublicId: publicId,
        updatedAt: new Date(),
      },
    });
  }

  async deleteProfileImage(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImgUrl: null,
        profileImgPublicId: null,
        updatedAt: new Date(),
      },
    });
  }

  async verifyEmail(userId: number, emailVerified: boolean, status: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.prisma;
    await client.user.update({
      where: { id: userId },
      data: { emailVerified: emailVerified, status: status as any, updatedAt: new Date() },
    });
  }

  async getNavbarUser(userId: number): Promise<NavbarUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        profileImgUrl: true,
        lastLogin: true,
        createdAt: true,
        role: true,
      },
    });

    return user
      ? new NavbarUser(
          user.username,
          user.email,
          user.profileImgUrl,
          user.lastLogin,
          user.createdAt,
          user.role,
        )
      : null;
  }

  async findUnverifiedBefore(date: Date) {
    return this.prisma.user.findMany({
      where: { emailVerified: false, createdAt: { lt: date } },
      select: { id: true },
    });
  }

  async deleteById(userId: number): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async findByIdentifierForAuth(identifier: string) {
    const user = await this.prisma.user.findFirst({
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
        emailVerified: true,
      }
    });

    if (!user) return null;

    // Map camelCase to snake_case for interface
    return {
      id: user.id,
      password: user.password,
      status: user.status,
      role: user.role,
      username: user.username,
      email: user.email,
      email_verified: user.emailVerified,
    };
  }

  async findByIdWithPassword(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hashed = await hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        updatedAt: new Date(),
      },
    });
  }

  async findByIdentifierForVerification(identifier: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      role: user.role,
      status: user.status,
      email_verified: user.emailVerified,
    };
  }
}