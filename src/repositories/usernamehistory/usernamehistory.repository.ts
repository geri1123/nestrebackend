// import { prisma } from '../../config/prisma.js';

import { IUsernameHistoryRepository } from './Iusername-history.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Injectable } from '@nestjs/common';
@Injectable()
export class UsernameHistoryRepository implements IUsernameHistoryRepository {
  constructor(private prisma: PrismaService) {}
  async getLastUsernameChange(userId: number): Promise<any | null> {
    const record = await this.prisma.usernamehistory.findFirst({
      where: { user_id: userId },
      orderBy: { next_username_update: 'desc' },
    });
    return record;
  }

  async saveUsernameChange(
    userId: number,
    oldUsername: string,
    newUsername: string,
    nextUpdateDate: Date
  ): Promise<void> {
    await this.prisma.usernamehistory.create({
      data: {
        user_id: userId,
        old_username: oldUsername,
        new_username: newUsername,
        next_username_update: nextUpdateDate,
      },
    });
  }
}

