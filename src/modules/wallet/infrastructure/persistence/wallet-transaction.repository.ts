import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Prisma, WalletTransaction, WalletTransactionType } from "@prisma/client";
import {
  IWalletTransactionRepository,
  CreateTransactionData,
} from "../../domain/repositories/wallet-transaction.interface.repository";

@Injectable()
export class WalletTransactionRepository implements IWalletTransactionRepository {
  constructor(private prisma: PrismaService) {}

  createTransactionTx(
    tx: Prisma.TransactionClient,
    data: CreateTransactionData,
  ): Promise<WalletTransaction> {
    return tx.walletTransaction.create({ data });
  }

  findByExternalPaymentIdTx(
    tx: Prisma.TransactionClient,
    externalPaymentId: string,
  ): Promise<WalletTransaction | null> {
    return tx.walletTransaction.findUnique({
      where: { externalPaymentId },
    });
  }

  getTransactions(walletId: string, page = 1, limit = 10): Promise<WalletTransaction[]> {
    const skip = (page - 1) * limit;
    return this.prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });
  }
private readonly userInclude = {
  wallet: {
    include: {
      user: { select: { id: true, username: true, email: true } },
    },
  },
} satisfies Prisma.WalletTransactionInclude;

getAllTransactions(page: number, sortBy: "date" | "amount", order: "asc" | "desc", type?: WalletTransactionType) {
  return this.prisma.walletTransaction.findMany({
    where: {
      ...(type ? { type } : {}),
    },
    include: this.userInclude,
    orderBy: sortBy === "date" ? { createdAt: order } : { amount: order },
    skip: (page - 1) * 20,
    take: 20,
  });
}

countAllTransactions(type?: WalletTransactionType): Promise<number> {
  return this.prisma.walletTransaction.count({
    where: { ...(type ? { type } : {}) },
  });
}

getUserTransactions(userId: number, page: number, sortBy: "date" | "amount", order: "asc" | "desc") {
  return this.prisma.walletTransaction.findMany({
    where: { wallet: { userId } },
    include: this.userInclude,
    orderBy: sortBy === "date" ? { createdAt: order } : { amount: order },
    skip: (page - 1) * 20,
    take: 20,
  });
}
countTransaction(walletId: string): Promise<number> {
  return this.prisma.walletTransaction.count({ where: { walletId } });
}
countUserTransactions(userId: number): Promise<number> {
  return this.prisma.walletTransaction.count({ where: { wallet: { userId } } });
}
}