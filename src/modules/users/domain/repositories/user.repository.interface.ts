import { User } from "../entities/user.entity";
import { NavbarUser } from "../value-objects/navbar-user.vo";

export interface IUserDomainRepository {
  findById(userId: number): Promise<User | null>;
  findByIdentifier(identifier: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  usernameExists(username: string): Promise<boolean>;
  emailExists(email: string): Promise<boolean>;
  create(data: CreateUserData): Promise<number>;
  updateFields(userId: number, fields: Partial<UpdateUserFields>): Promise<void>;
  updateUsername(userId: number, newUsername: string): Promise<void>;
  updateProfileImage(userId: number, imageUrl: string): Promise<void>;
  deleteProfileImage(userId: number): Promise<void>;
  verifyEmail(userId: number, emailVerified: boolean, status: string): Promise<void>;
  getNavbarUser(userId: number): Promise<NavbarUser | null>;
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
   last_active?: Date;
  profile_img?: string | null;
}