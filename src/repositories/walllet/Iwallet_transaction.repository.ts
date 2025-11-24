import { wallet_transaction_type, WalletTransaction, Prisma } from "@prisma/client";

export interface IWalletTransaction {
 
  createTransactionTx(
    tx: Prisma.TransactionClient, 
    walletId: string,
    type: wallet_transaction_type,
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