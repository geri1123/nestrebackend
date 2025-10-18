import { passwordresettoken } from "@prisma/client";

export interface IPasswordResetToken{
  create(userId: number, token: string, expiresAt: Date): Promise<passwordresettoken>;
  findByToken(token: string): Promise<passwordresettoken | null>;
  deleteByUserId(userId: number): Promise<void>;
  delete(token: string): Promise<void>;
}