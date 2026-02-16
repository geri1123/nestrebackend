import { Injectable } from '@nestjs/common';

import { IUsernameHistoryDomainRepository } from '../../domain/repositories/username-history.repository.interface';
import { UsernameHistory } from '../../domain/entities/username-history.entity';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

@Injectable()
export class UsernameHistoryRepository implements IUsernameHistoryDomainRepository {
  constructor(private prisma: PrismaService) {}

  async getLastUsernameChange(userId: number): Promise<UsernameHistory | null> {
    const record = await this.prisma.usernameHistory.findFirst({
      where: { userId: userId },
      orderBy: { nextUsernameUpdate: 'desc' },
    });

    if (!record) return null;

    return UsernameHistory.create({
      id: record.id,
      user_id: record.userId,
      old_username: record.oldUsername,
      new_username: record.newUsername,
      next_username_update: record.nextUsernameUpdate,
    });
  }

  async saveUsernameChange(
    userId: number,
    oldUsername: string,
    newUsername: string,
    nextUpdateDate: Date,
  ): Promise<void> {
    await this.prisma.usernameHistory.create({
      data: {
        userId: userId,
        oldUsername: oldUsername,
        newUsername: newUsername,
        nextUsernameUpdate: nextUpdateDate,
      },
    });
  }
}