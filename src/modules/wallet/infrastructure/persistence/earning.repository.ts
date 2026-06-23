import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Prisma, WalletTransactionType } from "@prisma/client";
import { DailyBreakdown, EarningsPeriod, IEarningsRepository, MonthlyBreakdown } from "../../domain/repositories/earning.interface.repository";


@Injectable()
export class EarningsRepository implements IEarningsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getEarningsForPeriod(from?: Date, to?: Date): Promise<EarningsPeriod> {
    const where: Prisma.WalletTransactionWhereInput = {
       type: WalletTransactionType.topup,
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const result = await this.prisma.walletTransaction.aggregate({
      where,
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    return {
      totalAmount: result._sum.amount?.toNumber() ?? 0,
      transactionCount: result._count.id,
      averageAmount: result._avg.amount?.toNumber() ?? 0,
    };
  }

  async getDailyBreakdown(days: number): Promise<DailyBreakdown[]> {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.walletTransaction.findMany({
      where: {
         type: WalletTransactionType.topup,
        createdAt: { gte: from },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped = new Map<string, { amount: number; count: number }>();

    for (const tx of transactions) {
      const dateKey = tx.createdAt.toISOString().split("T")[0];
      const existing = grouped.get(dateKey) ?? { amount: 0, count: 0 };
      grouped.set(dateKey, {
        amount: existing.amount + tx.amount.toNumber(),
        count: existing.count + 1,
      });
    }

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getMonthlyBreakdown(months: number): Promise<MonthlyBreakdown[]> {
    const from = new Date();
    from.setMonth(from.getMonth() - months);
    from.setDate(1);
    from.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.walletTransaction.findMany({
      where: {
          type: WalletTransactionType.topup,
        createdAt: { gte: from },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped = new Map<string, { amount: number; count: number }>();

    for (const tx of transactions) {
      const d = tx.createdAt;
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const existing = grouped.get(monthKey) ?? { amount: 0, count: 0 };
      grouped.set(monthKey, {
        amount: existing.amount + tx.amount.toNumber(),
        count: existing.count + 1,
      });
    }

    return Array.from(grouped.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));
  }
}