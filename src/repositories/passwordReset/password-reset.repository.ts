import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { passwordresettoken } from '@prisma/client';
import { IPasswordResetToken } from './Ipassword-reset.repository.js';


@Injectable()
export class PasswordResetTokenRepository implements IPasswordResetToken{
    constructor(private prisma:PrismaService){

    }
async create(userId: number, token: string, expiresAt: Date): Promise<passwordresettoken> {
    return this.prisma.passwordresettoken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findByToken(token: string): Promise<passwordresettoken | null> {
    return this.prisma.passwordresettoken.findUnique({ where: { token } });
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.passwordresettoken.deleteMany({ where: { userId } });
  }

  async delete(token: string): Promise<void> {
    await this.prisma.passwordresettoken.delete({ where: { token } });
  }
}
