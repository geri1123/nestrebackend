import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../infrastructure/prisma/prisma.service";
import { Prisma, PrismaClient, WalletTransactionType, WalletTransaction } from "@prisma/client";
import { IWalletTransactionRepository } from "../../domain/repositories/wallet-transaction.interface.repository";

@Injectable()
export class WalletTransactionRepository implements IWalletTransactionRepository{
  constructor(private prisma: PrismaService) {}

  async createTransactionTx(tx: Prisma.TransactionClient, walletId: string, type: WalletTransactionType, amount: number, balanceAfter: number, description: string) {
  return tx.walletTransaction.create({ data: { walletId, type, amount, balanceAfter, description } });
}


   getTransactions(
  walletId: string,
  page = 1,      
  limit = 10      
): Promise<WalletTransaction[]> {
  const skip = (page - 1) * limit;

  return this.prisma.walletTransaction.findMany({
    where: { walletId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}
countTransaction(walletId: string):Promise<number> {
  return this.prisma.walletTransaction.count({
    where: { walletId }
  });
}
}
