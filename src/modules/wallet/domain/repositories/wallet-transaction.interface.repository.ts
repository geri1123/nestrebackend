import { WalletTransactionType, WalletTransaction, Prisma } from "@prisma/client";

export interface IWalletTransactionRepository {
 
  createTransactionTx(
    tx: Prisma.TransactionClient, 
    walletId: string,
    type: WalletTransactionType,
    amount: number,
    balanceAfter: number,
    description?: string
  ): Promise<WalletTransaction>;

  
  getTransactions(
    walletId: string,
    page: number,
    limit: number
  ): Promise<WalletTransaction[]>;

  
  countTransaction(walletId: string): Promise<number>;
}