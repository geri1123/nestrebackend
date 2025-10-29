
import { user_status } from '@prisma/client';
import type { BaseUserInfo } from '../../users/types/base-user-info.js';
import type { UserCreationData, UserRegistration } from '../../auth/types/create-user-input.js';
import { PartialUserForLogin , PartialUserByToken } from '../../types/user.js';
import { UpdatableUserFields } from '../../users/types/update-user-info.js';
export interface IUserRepository {
  create(userData: UserCreationData): Promise<number>;
updateProfileImage(userId: number, imageUrl: string): Promise<void> ;
  findByIdWithPassword(userId: number): Promise<{ id: number; password: string } | null>;
  findById(userId: number): Promise<BaseUserInfo | null>;
  findByIdentifier(identifier: string): Promise<PartialUserForLogin | null>;
  findByVerificationToken(token: string): Promise<PartialUserByToken | null>;
  findByIdForProfileImage(userId: number): Promise<{ id: number; profile_img: string | null } | null>;
  getUsernameById(userId: number): Promise<string | null>;
  getUserPasswordById(userId: number): Promise<string | null>;
  emailExists(email: string): Promise<boolean>;
  usernameExists(username: string): Promise<boolean>;
  findByEmail(email: string): Promise<{ id: number; email: string; first_name: string | null; email_verified: boolean; status: user_status } | null>;
 getNavbarUser(userId: number): Promise<{ username: string; email: string; profile_img: string | null; last_login: Date | null } | null>;
  updateFieldsById(userId: number, fields: Partial<UpdatableUserFields>): Promise<void>;
  verifyEmail(userId: number, emailVerified: boolean, statusToUpdate: user_status): Promise<void>;
  regenerateVerificationToken(userId: number, token: string, expires: Date): Promise<void>;
}