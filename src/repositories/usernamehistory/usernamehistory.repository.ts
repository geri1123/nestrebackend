import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IUsernameHistoryDomainRepository } from '../../modules/users/domain/repositories/username-history.repository.interface';
import { UsernameHistory } from '../../modules/users/domain/entities/username-history.entity';
@Injectable()
export class UsernameHistoryRepository implements IUsernameHistoryDomainRepository {
  constructor(private prisma: PrismaService) {}

  async getLastUsernameChange(userId: number): Promise<UsernameHistory | null> {
    const record = await this.prisma.usernamehistory.findFirst({
      where: { user_id: userId },
      orderBy: { next_username_update: 'desc' },
    });

    return record ? UsernameHistory.create(record) : null;
  }

  async saveUsernameChange(
    userId: number,
    oldUsername: string,
    newUsername: string,
    nextUpdateDate: Date,
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
