import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Prisma, WalletTransaction } from "@prisma/client";
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

  countTransaction(walletId: string): Promise<number> {
    return this.prisma.walletTransaction.count({ where: { walletId } });
  }
}