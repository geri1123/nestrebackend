import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { wallet_transaction_type, WalletTransaction } from "@prisma/client";
import { IwalletTransaction } from "./Iwallet_transaction.repository";

@Injectable()
export class WalletTransactionRepository implements IwalletTransaction{
  constructor(private prisma: PrismaService) {}

  // Create a wallet transaction
 async createTransaction(
  walletId: string,
  type: wallet_transaction_type, 
  amount: number,
  balanceAfter: number,
  description?: string
): Promise<WalletTransaction> {
  return this.prisma.walletTransaction.create({
    data: {
      walletId,
      type,  
      amount,
      balanceAfter,
      description,
    },
  });
}

  async getTransactions(
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
}
