import { Prisma, user_role } from "@prisma/client";
import { User } from "../entities/user.entity";
import { NavbarUser } from "../value-objects/navbar-user.vo";
import { userStatus } from "../types/user-status.type";
export const USER_REPO = Symbol('USER_REPO');
export interface IUserDomainRepository {
  findById(userId: number): Promise<User | null>;
  findByIdentifier(identifier: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  usernameExists(username: string): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
  create(data: CreateUserData ,   tx?: Prisma.TransactionClient): Promise<number>;
  updateFields(userId: number, fields: Partial<UpdateUserFields> , tx?: Prisma.TransactionClient): Promise<void>;
  updateUsername(userId: number, newUsername: string): Promise<void>;
  updateProfileImage(userId: number, imageUrl: string): Promise<void>;
  deleteProfileImage(userId: number): Promise<void>;
  verifyEmail(userId: number, emailVerified: boolean, status: string , tx?:Prisma.TransactionClient): Promise<void>;
  getNavbarUser(userId: number): Promise<NavbarUser | null>;
  findUnverifiedBefore(date: Date): Promise<{ id: number }[]>;
deleteById(userId: number): Promise<void>;
 findByIdWithPassword(userId: number): Promise<{
    id: number;
    password: string;} | null>;
    
 findByIdentifierForAuth(identifier: string): Promise<{
    id: number;
    password: string;
    status: string;
    role: string;
    username: string;
    email: string;
  } | null>;
  updatePassword(userId: number, newPassword: string): Promise<void>;
  findByIdentifierForVerification(identifier: string): Promise<{
  id: number;
  email: string;
  first_name: string | null;
  role: string;
  status: string;
  email_verified: boolean;
} | null>;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'agency_owner' | 'agent';
  status: string;
}

export interface UpdateUserFields {
  first_name?: string;
  last_name?: string;
  about_me?: string;
  phone?: string;
  password?: string;
  last_login?: Date;
  role:user_role;
  status?:userStatus;
   last_active?: Date;
  profile_img?: string | null;
}