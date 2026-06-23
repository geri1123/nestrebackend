import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { IWalletRepository } from "../../domain/repositories/wallet.interface.repository";
import { WalletDomainEntity } from "../../domain/entities/wallet.entity";

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(private prisma: PrismaService) {}

  async createWallet(userId: number, currency = "EUR"): Promise<WalletDomainEntity> {
    const wallet = await this.prisma.wallet.create({
      data: { userId, balance: 0, currency },
    });
    return WalletDomainEntity.fromPrisma(wallet);
  }

  async getWalletByUser(userId: number): Promise<WalletDomainEntity | null> {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    return wallet ? WalletDomainEntity.fromPrisma(wallet) : null;
  }
 
  async findByUserIdTx(
    tx: Prisma.TransactionClient,
    userId: number,
  ): Promise<WalletDomainEntity | null> {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    return wallet ? WalletDomainEntity.fromPrisma(wallet) : null;
  }

  async incrementBalanceTx(
    tx: Prisma.TransactionClient,
    walletId: string,
    amount: number,
  ): Promise<number> {
   const updated = await tx.wallet.update({
    where: { id: walletId },
    data: { balance: { increment: amount } },
  });
  return updated.balance.toNumber();
  }

  async decrementBalanceIfSufficientTx(
    tx: Prisma.TransactionClient,
    walletId: string,
    amount: number,
  ): Promise<number | null> {
     const result = await tx.wallet.updateMany({
    where: { id: walletId, balance: { gte: amount } },
    data: { balance: { decrement: amount } },
  });

  if (result.count === 0) return null;

  const fresh = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } });
  return fresh.balance.toNumber(); 
  }
  async getAllWallets(params?: {
  userId?: number;
  username?: string;
  page?: number;
  limit?: number;
}):  Promise<{
  id: string;
  userId: number;
  username?: string;
  balance: number;
  currency: string;
  createdAt: Date;
}[]> {
  const { userId, username, page = 1, limit = 20 } = params || {};

  const wallets = await this.prisma.wallet.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(username
        ? {
            user: {
              username: {
                contains: username,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },
   include: {
  user: {
    select: {
      id: true,
      username: true,
    },
  },
},
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

 return wallets.map(w => ({
  id: w.id,
  userId: w.userId,
  username: w.user?.username,
  balance: w.balance.toNumber(),
  currency: w.currency,
  createdAt: w.createdAt,
}));
}
}